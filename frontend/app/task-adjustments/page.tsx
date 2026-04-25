"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { AppShell } from "../_components/app-shell";
import { ChevronDown, ChevronUp, FolderKanban, MailCheck, AlertTriangle, Clock } from "lucide-react";
import { api, Task, User, formatDate, parseDate } from "../_lib/api";

type TaskStatus = "todo" | "in-progress" | "done" | "completed" | "pending";

type ProjectGroup = {
  id: string;
  name: string;
  tasks: Task[];
};

const statusStyles: Record<string, string> = {
  "todo": "bg-slate-100 text-slate-700",
  "pending": "bg-slate-100 text-slate-700",
  "not started": "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-800",
  "done": "bg-emerald-100 text-emerald-800",
  "completed": "bg-emerald-100 text-emerald-800",
};

function isTaskStalled(task: Task) {
  if (task.status.toLowerCase() !== "in-progress") return false;
  if (!task.lastStatusUpdate) return false;

  const dateObj = parseDate(task.lastStatusUpdate);
  if (!dateObj) return false;

  const timeDiff = new Date().getTime() - dateObj.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);

  return daysDiff >= 2; // Stalled if no status update in 2 days
}

export default function TaskAssignmentsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, usersData] = await Promise.all([
        api.getTasks(),
        api.getUsers()
      ]);

      // 1. Define the exact order for the statuses
      const statusRank: Record<string, number> = {
        'done': 1,
        'in-progress': 2,
        'todo': 3
      };

      // Helper to safely get the timestamp number
      const getSafeTime = (dateVal: any) => {
        if (!dateVal) return Infinity; // Push to bottom if no date

        // If it's a standard string or number
        let time = new Date(dateVal).getTime();

        // If it's a raw Firestore timestamp object from JSON
        if (isNaN(time)) {
          if (dateVal._seconds) return dateVal._seconds * 1000;
          if (dateVal.seconds) return dateVal.seconds * 1000;
        }

        return isNaN(time) ? Infinity : time;
      };

      // 2. Apply the two-tier sort to the raw data
      const sortedTasks = [...tasksData].sort((a, b) => {
        // Tier 1: Status Rank
        const rankA = statusRank[a.status?.toLowerCase()] || 4;
        const rankB = statusRank[b.status?.toLowerCase()] || 4;

        if (rankA !== rankB) {
          return rankA - rankB;
        }

        // Tier 2: Date Sort using the safe helper
        return getSafeTime(a.deadline) - getSafeTime(b.deadline);
      });

      // 3. Set your state using the newly sorted array
      setTasks(sortedTasks);
      setUsers(usersData);

      const pIds = new Set(sortedTasks.map(t => t.projectId || "unassigned"));
      const openState: Record<string, boolean> = {};
      pIds.forEach(id => { openState[id] = true; });
      setOpenProjects(openState);

    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (uid: string) => {
    const user = users.find(u => u.id === uid);
    return user ? user.name : uid;
  };

  const projects = useMemo(() => {
    const grouped: Record<string, ProjectGroup> = {};
    tasks.forEach(task => {
      const pId = task.projectId || "unassigned";
      if (!grouped[pId]) {
        grouped[pId] = {
          id: pId,
          name: pId.replace("proj_", "").toUpperCase(),
          tasks: []
        };
      }
      grouped[pId].tasks.push(task);
    });
    return Object.values(grouped);
  }, [tasks]);

  const stalledTasks = useMemo(() => {
    return tasks.filter(isTaskStalled);
  }, [tasks]);

  function toggleProject(projectId: string) {
    const expanded = !openProjects[projectId];
    setOpenProjects((prev) => ({ ...prev, [projectId]: expanded }));
  }

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Task Assignments...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Task Assignments</h1>
          <p className="text-sm font-medium text-muted-foreground">Monitor progress and task flow by project</p>
        </header>

        {stalledTasks.length > 0 && (
          <section className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" />
              Stalled Tasks Detected ({stalledTasks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stalledTasks.map(task => (
                <div key={`stalled-${task.id}`} className="bg-white border border-red-100 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                  <p className="text-sm font-bold text-slate-800">{task.title}</p>
                  <p className="text-xs text-red-600 font-medium">
                    No updates since {formatDate(task.lastStatusUpdate)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-auto">
                    Assigned to: <span className="font-bold">{task.assignedTo ? getUserName(task.assignedTo) : "Unassigned"}</span> | Project: {task.projectId?.replace("proj_", "").toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-5">
          {projects.map((project) => {
            const isOpen = openProjects[project.id];
            const completedCount = project.tasks.filter(t => t.status.toLowerCase() === "done" || t.status.toLowerCase() === "completed").length;
            const progress = project.tasks.length > 0 ? Math.round((completedCount / project.tasks.length) * 100) : 0;

            return (
              <article
                key={project.id}
                id={project.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{project.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground">{progress}% completed</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-slate-50 transition-colors"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Collapse" : "Expand"}
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-6 space-y-3">
                    {project.tasks.map((task) => {
                      const stalled = isTaskStalled(task);

                      return (
                        <div
                          key={task.id}
                          className={`grid grid-cols-1 gap-4 rounded-xl border p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr_auto] md:items-center transition-colors ${stalled ? 'bg-red-50/30 border-red-200' : 'bg-white border-border'
                            }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                              {task.title}
                              {stalled && (
                                <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider font-bold">
                                  <AlertTriangle className="w-3 h-3" /> Stalled
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                              {task.deadline && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Due {formatDate(task.deadline)}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {task.assignedTo ? getUserName(task.assignedTo).charAt(0).toUpperCase() : '?'}
                            </div>
                            <p className="text-sm text-muted-foreground">{task.assignedTo ? getUserName(task.assignedTo) : "Unassigned"}</p>
                          </div>

                          <div className="flex justify-start">
                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[task.status.toLowerCase()] || statusStyles["todo"]}`}>
                              {task.status.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
