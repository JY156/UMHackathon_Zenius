"use client";

import { useState } from "react";
import { AppShell } from "../_components/app-shell";
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  ChevronRight, 
  History, 
  Filter, 
  Calendar,
  Sparkles,
  User,
  Activity,
  ArrowRight
} from "lucide-react";

const alerts = [
  {
    id: 1,
    name: "Sarah Connor",
    trigger: "Sick Leave",
    type: "Absence",
    affectedTasks: 5,
    status: "Pending",
    urgency: "urgent", // urgent, warning, stable
    recommendation: "Assign sprint tickets to Lena + Marcus based on 92% skill match and capacity.",
  },
  {
    id: 2,
    name: "Priya Singh",
    trigger: "Overwhelmed",
    type: "Overload",
    affectedTasks: 3,
    status: "Pending",
    urgency: "warning",
    recommendation: "Shift high-priority tickets to Wei; defer lower-priority maintenance tasks to next sprint.",
  }
];

const history = [
  {
    id: 101,
    timestamp: "10 mins ago",
    status: "Synced to Jira",
    before: { name: "Amir Khan", load: 95, blockers: "High" },
    after: { name: "Lena Meyer", load: 65, blockers: "None" },
    explanation: "Model prioritized delivery risk and shifted tasks to Lena who has 30% available capacity in current sprint.",
  },
  {
    id: 102,
    timestamp: "1 hour ago",
    status: "Synced to Jira",
    before: { name: "Sarah Connor", load: 110, blockers: "Critical" },
    after: { name: "Marcus Wright", load: 45, blockers: "Low" },
    explanation: "Reassigned due to Sarah's emergency leave; Marcus identified as best fit due to overlap in project context.",
  }
];

export default function TaskAdjustmentsPage() {
  const [filterType, setFilterType] = useState("All");

  return (
    <AppShell>
      <div className="space-y-10 pb-12">
        {/* 1. Page Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Task Adjustments</h1>
          <p className="text-muted-foreground font-medium">Manage alerts and track reassignments</p>
        </header>

        {/* 2. Pending Alerts Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-sidebar flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Alerts
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select className="bg-transparent focus:outline-none">
                  <option>Status: Pending</option>
                  <option>Status: Resolved</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <select className="bg-transparent focus:outline-none">
                  <option>Type: All</option>
                  <option>Type: Absence</option>
                  <option>Type: Overload</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Past 7 Days</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {alerts.map((alert) => (
              <div key={alert.id} className="group relative rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${alert.urgency === 'urgent' ? 'bg-red-500' : 'bg-orange-500'}`} />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-sidebar-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sidebar">{alert.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${alert.type === 'Absence' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                        {alert.trigger} ({alert.type})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-sidebar">{alert.affectedTasks}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tasks Affected</p>
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 relative">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    ZENIUS AI RECOMMENDATION
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                    {alert.recommendation}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 bg-sidebar-primary text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button className="flex items-center justify-center w-11 h-11 rounded-lg border border-border text-muted-foreground hover:bg-gray-50 transition-colors">
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <button className="flex items-center justify-center w-11 h-11 rounded-lg border border-border text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Reassignment History Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold text-sidebar flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              Reassignment History
            </h2>
          </div>

          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Before */}
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Before</p>
                    <div className="space-y-1">
                      <p className="font-bold text-sidebar">{item.before.name}</p>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-red-500 h-full" style={{ width: '100%' }} />
                         </div>
                         <span className="text-xs font-bold text-red-500">{item.before.load}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Blockers: {item.before.blockers}</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">After</p>
                    <div className="space-y-1">
                      <p className="font-bold text-sidebar uppercase">{item.after.name}</p>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-green-500 h-full" style={{ width: `${item.after.load}%` }} />
                         </div>
                         <span className="text-xs font-bold text-green-500">{item.after.load}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Blockers: {item.after.blockers}</p>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="lg:border-l border-dashed border-border lg:pl-8 space-y-3">
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Insight
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{item.explanation}"
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                        {item.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}