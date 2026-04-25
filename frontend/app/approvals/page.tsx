"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../_components/app-shell";
import { api, Approval, Task, User, formatTime, formatDate } from "../_lib/api";
import { ShieldAlert, CheckCircle2, Check, X, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [approvalsData, tasksData, usersData] = await Promise.all([
        api.getPendingApprovals(),
        api.getTasks(),
        api.getUsers()
      ]);
      setApprovals(approvalsData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch {
      toast.error("Failed to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.updateApproval(id, "approved");
      toast.success("Task reassignment approved");
      fetchData();
    } catch {
      toast.error("Failed to approve reassignment");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.updateApproval(id, "rejected");
      toast.success("Task reassignment rejected");
      fetchData();
    } catch {
      toast.error("Failed to reject reassignment");
    }
  };

  const handleEditAssignee = (id: string, newUid: string) => {
    toast.success(`Assignee changed to ${users.find(u => u.id === newUid)?.name} (mocked)`);
    // In reality, we would patch the approval to change the suggested toUid before approving.
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Approvals...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
            AI Action Queue
            {approvals.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full animate-pulse font-bold ml-2">
                {approvals.length} Pending
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Review and approve AI-generated workflow decisions and task reassignments.
          </p>
        </header>

        <section className="bg-card rounded-2xl border border-primary/20 flex flex-col shadow-md overflow-hidden relative w-full">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-primary to-amber-400"></div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30 min-h-[500px]">
            {approvals.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                <CheckCircle2 className="w-16 h-16 text-emerald-500/20" />
                <p className="text-lg font-semibold text-muted-foreground">All caught up! No pending approvals.</p>
              </div>
            )}
            
            {approvals.map((approval) => {
              const task = tasks.find(t => t.id === approval.suggestedTid);
              const toUser = users.find(u => u.id === approval.toUid);
              const fromUser = users.find(u => u.id === approval.fromUid);

              return (
                <div key={approval.id} className="bg-white rounded-xl border border-primary/20 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <span className="text-sm font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-md">
                      Reassign Task
                    </span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Generated {formatDate(approval.createdAt || new Date().toISOString())} {formatTime(approval.createdAt || new Date().toISOString())}
                    </span>
                  </div>
                  
                  <div className="flex flex-col xl:flex-row gap-6 h-full items-stretch">
                    {/* Left content area */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {task?.title || "Unknown Task"} <span className="text-slate-400 font-normal">({fromUser?.name} &rarr; {toUser?.name})</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                          Task ID: {approval.suggestedTid} | Project: {task?.projectId?.replace("proj_", "").toUpperCase() || "N/A"}
                        </p>
                      </div>

                      {/* Reasoning Quote Box */}
                      <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 relative shadow-inner h-full flex flex-col justify-center">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/50 rounded-l-lg"></div>
                        <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-2 pl-3">AI Reasoning Engine</p>
                        <p className="text-sm italic text-slate-700 pl-3 leading-relaxed">
                          &quot;{approval.reasoning}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Right action area */}
                    <div className="flex flex-col gap-3 xl:w-[220px] shrink-0 justify-end">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <Check className="w-5 h-5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 py-3.5 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 active:scale-[0.98]"
                      >
                        <X className="w-5 h-5" /> Reject
                      </button>
                      
                      {/* Select Member dropdown */}
                      <div className="relative w-full">
                        <div className="w-full bg-white text-blue-600 py-3.5 px-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-blue-200 pointer-events-none">
                          <Users className="w-4 h-4" /> Change Assignee
                        </div>
                        <select 
                          onChange={(e) => handleEditAssignee(approval.id, e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled>Change Assignee</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
