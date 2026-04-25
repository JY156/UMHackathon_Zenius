"use client";

import { useEffect, useState } from "react";
import { api, InputMessage, Approval, Log } from "../_lib/api";
import { Mail, Paperclip, CheckCircle2, Clock, Check, X, ShieldAlert, FileText } from "lucide-react";
import toast from "react-hot-toast";

export function AgentCommandCenter() {
  const [inputs, setInputs] = useState<InputMessage[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [inputsData, approvalsData, logsData] = await Promise.all([
        api.getInputs(),
        api.getPendingApprovals(),
        api.getLogs()
      ]);
      setInputs(inputsData);
      setApprovals(approvalsData);
      setLogs(logsData);
    } catch {
      toast.error("Failed to load command center data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Command Center...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Panel: Triage Inbox */}
      <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm overflow-hidden">
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
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">{msg.subject || 'No Subject'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      </div>

      {/* Center Panel: AI Approval Queue */}
      <div className="bg-card rounded-2xl border border-primary/20 flex flex-col shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-primary to-emerald-400"></div>
        <div className="p-4 border-b border-border bg-slate-50/50">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Action Required
            {approvals.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full animate-pulse">{approvals.length} Pending</span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">AI reassignment proposals awaiting review</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {approvals.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/20" />
              <p className="text-sm font-semibold text-muted-foreground">All caught up!</p>
            </div>
          )}
          {approvals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-xl border border-primary/20 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">
                  Reassign Task
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date(approval.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-foreground">Move task to {approval.suggested_assignee || 'another user'}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  Task ID: {approval.task_id}
                </p>
              </div>

              {/* Reasoning Quote Box */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-lg"></div>
                <p className="text-xs italic text-slate-600 pl-2">
                  &quot;{approval.reasoning}&quot;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleApprove(approval.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(approval.id)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: System Change Log */}
      <div className="bg-card rounded-2xl border border-border flex flex-col shadow-sm overflow-hidden">
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
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-xs font-semibold text-foreground">{log.event}</p>
                <p className="text-xs text-slate-500 mt-1">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
