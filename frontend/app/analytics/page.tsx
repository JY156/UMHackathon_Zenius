"use client";

import { AppShell } from "../_components/app-shell";
import { useState } from "react";
import { 
  Users, 
  BarChart3, 
  PieChart, 
  ChevronRight, 
  Info, 
  Calendar,
  AlertCircle,
  Clock,
  LayoutGrid
} from "lucide-react";

export default function AnalyticsPage() {
  const [filterType, setFilterType] = useState<"team" | "project">("team");

  // Gantt Chart Mock Data
  const ganttMembers = [
    { name: "John Chen", dept: "Engineering", tasks: [
      { id: "ZEN-101", x: 10, width: 40, status: "on-track" },
      { id: "ZEN-105", x: 60, width: 20, status: "at-risk" }
    ], absence: { start: 20, end: 35 } },
    { name: "Sarah Miller", dept: "Design", tasks: [
      { id: "ZEN-202", x: 0, width: 30, status: "on-track" },
      { id: "ZEN-208", x: 70, width: 25, status: "overdue" }
    ] },
    { name: "Robert Fox", dept: "Engineering", tasks: [
      { id: "ZEN-103", x: 15, width: 50, status: "on-track" }
    ] },
    { name: "Emily Blunt", dept: "Product", tasks: [
      { id: "ZEN-301", x: 40, width: 30, status: "at-risk" }
    ], absence: { start: 5, end: 15 } }
  ];

  // Workload Ring Mock Data
  const workloadData = [
    { label: "Engineering", count: 45, percentage: 55, color: "bg-[#2D4A3E]" },
    { label: "Product & Design", count: 28, percentage: 35, color: "bg-[#426456]" },
    { label: "Operations", count: 12, percentage: 10, color: "bg-[#7A9A8D]" },
  ];

  return (
    <AppShell>
      <div className="max-w-[1400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Analytics</h1>
          <p className="text-[#64748B] text-sm">Track workload, completion, and timelines</p>
        </div>

        {/* 1. Gantt Chart (Top Section) */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden min-h-[450px]">
          <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Project Timeline (Gantt)</h2>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On Track</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> At Risk</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-slate-100" /> Absence</div>
            </div>
          </div>
          
          <div className="overflow-x-auto p-4">
            <div className="min-w-[800px]">
              {/* Timeline Header */}
              <div className="flex border-b border-[#F1F5F9] pb-2 mb-4">
                <div className="w-48 shrink-0 text-xs font-medium text-slate-400">TEAM MEMBER</div>
                <div className="flex-1 grid grid-cols-4 gap-0 text-[10px] font-bold text-slate-400 tracking-wider">
                  <div>WK 1</div>
                  <div>WK 2</div>
                  <div>WK 3</div>
                  <div>WK 4</div>
                </div>
              </div>

              {/* Chart Rows */}
              <div className="space-y-6">
                {ganttMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center group relative">
                    <div className="w-48 shrink-0">
                      <div className="text-sm font-medium text-slate-700">{member.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{member.dept}</div>
                    </div>
                    
                    <div className="flex-1 h-8 bg-slate-50/50 rounded-lg relative overflow-hidden group-hover:bg-slate-50 transition-colors">
                      {/* Absence Overlay */}
                      {member.absence && (
                        <div 
                          className="absolute h-full bg-slate-200/50 border-x border-slate-300 pointer-events-none"
                          style={{ left: `${member.absence.start}%`, width: `${member.absence.end - member.absence.start}%` }}
                        />
                      )}
                      
                      {/* Task Bars */}
                      {member.tasks.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className={`absolute top-1/2 -translate-y-1/2 h-4 rounded-full shadow-sm cursor-help transition-transform hover:scale-[1.02] ${
                            task.status === 'on-track' ? 'bg-emerald-500' : 
                            task.status === 'at-risk' ? 'bg-orange-500' : 'bg-rose-500'
                          }`}
                          style={{ left: `${task.x}%`, width: `${task.width}%` }}
                        >
                          <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                            <span className="text-[8px] font-bold text-white truncate">{task.id}</span>
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white rounded-lg p-3 text-[10px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl border border-white/10">
                            <div className="font-bold border-b border-white/10 pb-1 mb-1">{task.id}</div>
                            <div className="flex justify-between py-1"><span>Status:</span> <span className="capitalize">{task.status.replace('-', ' ')}</span></div>
                            <div className="flex justify-between"><span>Deadline:</span> <span>Apr 28, 2026</span></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Faux Dependency Line */}
                    {idx === 0 && (
                      <svg className="absolute w-full h-full pointer-events-none -z-10 overflow-visible">
                        <path d="M 350 40 L 370 40 L 370 100 L 400 100" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2. Task Completion Rate (Middle Section) */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-[#0F172A]">Task Completion Rate</h2>
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="team">By Team</option>
                <option value="project">By Project</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">Current Sprint Progress</span>
                  <span className="text-[#0F172A]">78%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '78%' }} />
                </div>
                <p className="text-[11px] text-[#64748B] italic">Throughput across current sprint</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Completed</div>
                  <div className="text-2xl font-bold text-[#0F172A]">142</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending</div>
                  <div className="text-2xl font-bold text-[#0F172A]">31</div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Workload Distribution (Bottom Section) */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-8">
              <PieChart className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Workload Distribution</h2>
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-10">
              <div className="relative w-48 h-48 group">
                {/* Circular Ring SVG */}
                <svg className="w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="#F1F5F9" strokeWidth="24" fill="transparent" />
                  <circle cx="96" cy="96" r="80" stroke="#2D4A3E" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset={502 * (1 - 0.55)} />
                  <circle cx="96" cy="96" r="80" stroke="#426456" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset={502 * (1 - 0.35)} transform="rotate(198, 96, 96)" />
                  <circle cx="96" cy="96" r="80" stroke="#7A9A8D" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset={502 * (1 - 0.10)} transform="rotate(324, 96, 96)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-[#0F172A]">85</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Tasks</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                {workloadData.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 cursor-default group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="font-semibold text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-slate-400">{item.count} tasks</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} transition-all duration-1000 group-hover:brightness-110`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-[#64748B] italic pt-2 border-t border-slate-100">Balance of assignments across teams</p>
              </div>
            </div>
          </section>
        </div>

      </div>
    </AppShell>
  );
}
