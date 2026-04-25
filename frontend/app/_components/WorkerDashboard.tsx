"use client";

import { useEffect, useState } from "react";
import { api, Task, User, Approval, formatDate } from "../_lib/api";
import { AlertTriangle, ShieldAlert, Flag, Clock } from "lucide-react";
import toast from "react-hot-toast";

const NC_UID = "user_nc";

export function WorkerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, tasksData, approvalsData, allTasksData] = await Promise.all([
        api.getUsers(),
        api.getUserTasks(NC_UID),
        api.getApprovals(),
        api.getTasks()
      ]);
      const currentUser = usersData.find(u => u.id === NC_UID) || null;
      setUser(currentUser || {
        id: NC_UID,
        name: "NC",
        role: "worker",
        current_load: 92, // hardcode > 90 to show burnout risk as requested
        task_capacity: 100,
        sentiment_score: 50
      });
      setTasks(tasksData);
      setAllTasks(allTasksData);
      setApprovals(approvalsData.filter(a => a.fromUid === NC_UID && a.status === "approved"));
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tid: string, newStatus: string) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === tid ? { ...t, status: newStatus } : t));
    try {
      await api.updateTaskStatus(tid, newStatus);
      toast.success(`Task moved to ${newStatus}`);
      fetchData();
    } catch {
      toast.error("Failed to update task");
      fetchData(); // revert
    }
  };

  const handleHelp = () => {
    toast.success("Help flagged! AI Agent has been notified and is analyzing the blocker.", {
      icon: '🤖',
      duration: 4000
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Dashboard...</div>;
  }

  const loadPercentage = user ? Math.round((user.current_load / user.task_capacity) * 100) : 0;
  let loadColor = "bg-emerald-500";
  if (loadPercentage >= 70 && loadPercentage <= 90) loadColor = "bg-amber-400";
  if (loadPercentage > 90) loadColor = "bg-rose-500";

  const todoTasks = tasks.filter(t => t.status.toLowerCase() === "to do" || t.status.toLowerCase() === "todo");
  const inProgTasks = tasks.filter(t => t.status.toLowerCase() === "in-progress" || t.status.toLowerCase() === "in progress");
  const doneTasks = tasks.filter(t => t.status.toLowerCase() === "completed" || t.status.toLowerCase() === "done");

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const tid = e.dataTransfer.getData("text/plain");
    if (tid) {
      handleUpdateStatus(tid, status);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Focus</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Manage your workload and track AI interventions.
        </p>
      </header>

      {/* Personal Capacity Gauge (HUD) */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Capacity Gauge</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Current load: {user?.current_load} / {user?.task_capacity} points
          </p>
          <div className="mt-4 relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full ${loadColor} transition-all duration-1000`}
              style={{ width: `${Math.min(loadPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs font-bold text-slate-500 mt-2 text-right">{loadPercentage}% Utilized</p>
        </div>
        {loadPercentage > 90 && (
          <div className="md:w-1/3 bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
            <div className="relative">
              <AlertTriangle className="w-5 h-5 text-rose-500 relative z-10" />
              <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-50"></div>
            </div>
            <div>
              <p className="text-sm font-bold text-rose-700">Burnout Risk</p>
              <p className="text-xs text-rose-600 mt-1">AI Intervention Active. Workload balancing in progress.</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Task Board */}
        <section className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Task Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* To Do */}
            <div 
              className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 min-h-[400px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'todo')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">To Do</h3>
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{todoTasks.length}</span>
              </div>
              <div className="space-y-3">
                {todoTasks.map(t => (
                  <TaskCard key={t.id} task={t} onHelp={handleHelp} />
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div 
              className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 min-h-[400px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'in-progress')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">In Progress</h3>
                <span className="bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">{inProgTasks.length}</span>
              </div>
              <div className="space-y-3">
                {inProgTasks.map(t => (
                  <TaskCard key={t.id} task={t} onHelp={handleHelp} />
                ))}
              </div>
            </div>

            {/* Completed */}
            <div 
              className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 min-h-[400px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'completed')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Done</h3>
                <span className="bg-emerald-200 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">{doneTasks.length}</span>
              </div>
              <div className="space-y-3">
                {doneTasks.map(t => (
                  <TaskCard key={t.id} task={t} onHelp={handleHelp} hideActions />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Resilience Feed */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">AI Action Log</h2>
          <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm h-[400px] overflow-hidden">
            <div className="p-4 border-b border-border bg-slate-50/50">
              <p className="text-xs text-muted-foreground">Approved workload interventions for your capacity.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {approvals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No recent AI interventions.</div>
              ) : (
                approvals.map(approval => {
                  const task = allTasks.find(t => t.id === approval.suggestedTid);
                  const taskTitle = task ? task.title : "Unknown Task";
                  
                  return (
                    <div key={approval.id} className="relative pl-6">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-100 border-2 border-emerald-500"></div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(approval.createdAt)}
                      </p>
                      <div className="bg-white border border-border rounded-xl p-3 shadow-sm mt-1">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">Task Reassigned</span>
                        </div>
                        <p className="text-sm text-foreground mb-1 line-clamp-1" title={taskTitle}>
                          <span className="font-semibold">{taskTitle}</span> <span className="text-muted-foreground text-xs">({approval.suggestedTid})</span>
                        </p>
                        <p className="text-sm text-foreground mb-1">Moved to: <span className="font-semibold">{approval.toUid}</span></p>
                        <p className="text-xs text-muted-foreground italic">Reason: {approval.reasoning}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TaskCard({ task, onHelp, hideActions = false }: { task: Task, onHelp: () => void, hideActions?: boolean }) {
  const projName = task.projectId ? task.projectId.replace("proj_", "").toUpperCase() : "UNASSIGNED";
  
  return (
    <div 
      className="bg-white border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        // Optional: set a visual drag image or effect
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
          {projName}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">{task.id}</span>
      </div>
      <h4 className="text-sm font-bold text-foreground leading-tight">{task.title}</h4>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {task.workload_score} pts
        </span>
        {task.deadline && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(task.deadline)}
          </span>
        )}
      </div>
      {!hideActions && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-bold py-1.5 rounded-lg transition-colors"
            onClick={onHelp}
          >
            <Flag className="w-3.5 h-3.5" /> Request Help
          </button>
        </div>
      )}
    </div>
  );
}
