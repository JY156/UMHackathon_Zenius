"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api, Task, InputMessage, Log, formatDate, formatTime } from "../_lib/api";
import { ArrowRight, Mail, Paperclip, Clock, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

type ProjectStats = {
  id: string;
  name: string;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  completionRate: number;
  dueDate?: string;
  dueDateMs?: number;
};

export function ManagerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputs, setInputs] = useState<InputMessage[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, inputsData, logsData] = await Promise.all([
        api.getTasks(),
        api.getInputs(),
        api.getLogs()
      ]);
      setTasks(tasksData);
      setInputs(inputsData);
      setLogs(logsData);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const projectStats = useMemo(() => {
    const grouped: Record<string, ProjectStats> = {};

    tasks.forEach(task => {
      const pId = task.projectId || "unassigned";
      if (!grouped[pId]) {
        grouped[pId] = {
          id: pId,
          name: pId.replace("proj_", "").toUpperCase(),
          totalTasks: 0,
          todoCount: 0,
          inProgressCount: 0,
          completedCount: 0,
          completionRate: 0,
        };
      }

      grouped[pId].totalTasks += 1;
      const st = task.status.toLowerCase();
      
      if (st === "done" || st === "completed") {
        grouped[pId].completedCount += 1;
      } else if (st === "in-progress") {
        grouped[pId].inProgressCount += 1;
      } else {
        grouped[pId].todoCount += 1;
      }

      if (task.deadline) {
        const tDate = new Date(task.deadline).getTime();
        if (!isNaN(tDate)) {
          if (!grouped[pId].dueDateMs || tDate < grouped[pId].dueDateMs!) {
            grouped[pId].dueDateMs = tDate;
            grouped[pId].dueDate = task.deadline;
          }
        }
      }
    });

    const statsArray = Object.values(grouped).map(p => ({
      ...p,
      completionRate: p.totalTasks > 0 ? Math.round((p.completedCount / p.totalTasks) * 100) : 0
    }));

    statsArray.sort((a, b) => {
      if (!a.dueDateMs) return 1;
      if (!b.dueDateMs) return -1;
      return a.dueDateMs - b.dueDateMs;
    });

    return statsArray;
  }, [tasks]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Project status overview, incoming signals, and system events.
        </p>
      </header>

      {/* Project Snapshot */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Project Snapshot</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of current active projects and their completion progress.
            </p>
          </div>
          <Link
            href="/task-adjustments"
            className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            View Task Assignments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {projectStats.map((project) => {
            const todoPct = project.totalTasks ? (project.todoCount / project.totalTasks) * 100 : 0;
            const inProgPct = project.totalTasks ? (project.inProgressCount / project.totalTasks) * 100 : 0;
            const donePct = project.totalTasks ? (project.completedCount / project.totalTasks) * 100 : 0;

            return (
              <div
                key={project.id}
                className="rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between"
              >
                <div className="sm:w-1/3">
                  <p className="text-sm font-bold text-foreground">{project.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.dueDate ? `Due: ${formatDate(project.dueDate)}` : 'No deadline'}
                  </p>
                </div>
                
                <div className="flex-1 w-full max-w-lg">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                    <span>{project.completedCount} Done</span>
                    <span>{project.inProgressCount} In Progress</span>
                    <span>{project.todoCount} To Do</span>
                  </div>
                  {/* Multi-segment progress bar with gradient */}
                  <div 
                    className="h-3 w-full rounded-full"
                    style={{ 
                      background: `linear-gradient(to right, 
                        #10b981 0%, 
                        #10b981 ${Math.max(0, donePct - 5)}%, 
                        #fcd34d ${donePct + 5}%, 
                        #fcd34d ${Math.max(0, (donePct + inProgPct) - 5)}%, 
                        #e2e8f0 ${(donePct + inProgPct) + 5}%, 
                        #e2e8f0 100%)`
                    }}
                  ></div>
                </div>

                <div className="sm:w-1/6 text-right">
                  <p className="text-xl font-bold text-foreground">{project.completionRate}%</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Completed</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lower Section: Inbox and System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Triage Inbox */}
        <section className="bg-card rounded-2xl border border-border flex flex-col shadow-sm overflow-hidden h-[400px]">
          <div className="p-4 border-b border-border bg-slate-50/50">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Triage Inbox
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{inputs.length}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Unprocessed incoming signals</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {inputs.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">No new messages</div>
            )}
            {inputs.map((msg) => (
              <div key={msg.id} className="p-3 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors shadow-sm relative group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.processed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {msg.processed ? <CheckCircle2 className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold line-clamp-1 ${msg.processed ? 'text-slate-500 line-through' : 'text-foreground'}`}>{msg.subject || 'No Subject'}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(msg.timestamp)} {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                  {msg.hasAttachments && (
                    <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* System Change Log */}
        <section className="bg-card rounded-2xl border border-border flex flex-col shadow-sm overflow-hidden h-[400px]">
          <div className="p-4 border-b border-border bg-slate-50/50">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              System Event Log
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Real-time state transitions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4">
              {logs.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm pl-4">No events logged</div>
              )}
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6 group">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-slate-300 group-hover:border-primary transition-colors"></div>
                  <p className="text-[10px] font-bold text-muted-foreground mb-0.5">
                    {formatDate(log.timestamp)} {formatTime(log.timestamp)}
                  </p>
                  <p className="text-xs font-semibold text-foreground">{log.event}</p>
                  <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
