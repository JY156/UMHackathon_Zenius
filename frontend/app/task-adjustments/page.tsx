"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "../_components/app-shell";
import { ChevronDown, ChevronUp, FolderKanban, MailCheck, RefreshCw } from "lucide-react";

type TaskStatus = "Not started" | "In Progress" | "Completed";

type TaskItem = {
  id: string;
  title: string;
  assignee: string;
  workload: number;
  status: TaskStatus;
};

type Project = {
  id: string;
  name: string;
  tasks: TaskItem[];
};

const statusStyles: Record<TaskStatus, string> = {
  "Not started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-amber-100 text-amber-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

const projectData: Project[] = [
  {
    id: "project-apollo",
    name: "Apollo CRM Migration",
    tasks: [
      { id: "apollo-1", title: "Map legacy fields to CRM schema", assignee: "Lena Meyer", workload: 62, status: "In Progress" },
      { id: "apollo-2", title: "Build import validation script", assignee: "Marcus Wright", workload: 48, status: "Not started" },
      { id: "apollo-3", title: "Sign off migration readiness", assignee: "Sarah Connor", workload: 70, status: "Completed" },
    ],
  },
  {
    id: "project-orbit",
    name: "Orbit Launch Readiness",
    tasks: [
      { id: "orbit-1", title: "Prepare partner onboarding checklist", assignee: "Priya Singh", workload: 54, status: "In Progress" },
      { id: "orbit-2", title: "Review manager email action items", assignee: "Amir Khan", workload: 45, status: "Completed" },
      { id: "orbit-3", title: "Resolve deployment blockers", assignee: "Jessica Day", workload: 63, status: "Not started" },
    ],
  },
  {
    id: "project-nova",
    name: "Nova Support Automation",
    tasks: [
      { id: "nova-1", title: "Tag incoming support email intents", assignee: "Wei Zhang", workload: 58, status: "In Progress" },
      { id: "nova-2", title: "Auto-route urgent tickets", assignee: "Noah Patel", workload: 44, status: "Completed" },
      { id: "nova-3", title: "Update escalation SLA matrix", assignee: "Emily Chen", workload: 52, status: "Not started" },
    ],
  },
];

export default function TaskAssignmentsPage() {
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>({
    "project-apollo": true,
    "project-orbit": true,
    "project-nova": true,
  });

  const [projects, setProjects] = useState(projectData);

  const totals = useMemo(() => {
    const allTasks = projects.flatMap((project) => project.tasks);
    const completed = allTasks.filter((task) => task.status === "Completed").length;

    return {
      tasks: allTasks.length,
      completed,
      completionRate: Math.round((completed / allTasks.length) * 100),
    };
  }, [projects]);

  function toggleProject(projectId: string) {
    const expanded = !openProjects[projectId];
    setOpenProjects((prev) => ({ ...prev, [projectId]: expanded }));
    toast.success(expanded ? "Project card expanded" : "Project card collapsed");
  }

  function autoAssignFromEmail(projectId: string) {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const [firstTask, ...rest] = project.tasks;
        if (!firstTask) return project;

        const nextStatus: TaskStatus = firstTask.status === "Not started" ? "In Progress" : firstTask.status;
        return {
          ...project,
          tasks: [{ ...firstTask, status: nextStatus }, ...rest],
        };
      }),
    );

    toast.success("Task auto-assigned from email");
  }

  function markProjectUpdated(projectName: string) {
    toast.success(`${projectName} updated`);
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Task Assignments</h1>
          <p className="text-sm font-medium text-muted-foreground">View tasks distributed by project</p>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary flex items-center gap-2">
            <MailCheck className="h-4 w-4" />
            Backend reads manager email and auto-detects tasks, workload, and skill-fit assignments.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total Tasks Assigned</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{totals.tasks}</p>
            </div>
            <div id="workload-projects" className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workload Distribution</p>
              <p className="mt-2 text-2xl font-bold text-foreground">Balanced by project</p>
            </div>
            <div id="completion-projects" className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Completion Rate</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{totals.completionRate}%</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {projects.map((project) => {
            const isOpen = openProjects[project.id];

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
                      <p className="text-xs text-muted-foreground">{project.tasks.length} tasks assigned</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => autoAssignFromEmail(project.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-slate-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Auto-assign
                    </button>
                    <button
                      onClick={() => markProjectUpdated(project.name)}
                      className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-slate-50"
                    >
                      Update project
                    </button>
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-slate-50"
                      aria-expanded={isOpen}
                      aria-controls={`${project.id}-content`}
                    >
                      {isOpen ? "Collapse" : "Expand"}
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div id={`${project.id}-content`} className="mt-4 space-y-3">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-white p-4 shadow-sm md:grid-cols-[2fr_1fr_1fr] md:items-center"
                      >
                        <p className="text-sm font-semibold text-foreground">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.assignee} <span className="font-semibold text-foreground">{task.workload}%</span>
                        </p>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
