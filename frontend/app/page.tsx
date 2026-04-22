"use client";

import { AppShell } from "./_components/app-shell";
import { useState, useEffect } from "react";
import { useRoleStore } from "./_store/role-store";
import { 
  Bell, 
  CheckCircle2, 
  RefreshCcw, 
  Users2, 
  AlertTriangle,
  ClipboardCheck,
  History,
  Info,
  ArrowUpRight,
  Target,
  Clock,
  CalendarCheck
} from "lucide-react";

const stats = [
  { 
    label: "Total Alerts", 
    value: "27", 
    icon: Bell, 
    trend: "increase", 
    color: "text-red-500",
    bg: "bg-red-50 text-red-600"
  },
  { 
    label: "Pending Approvals", 
    value: "08", 
    icon: ClipboardCheck, 
    trend: "neutral", 
    color: "text-orange-500",
    bg: "bg-orange-50 text-orange-600"
  },
  { 
    label: "Tasks Reassigned", 
    value: "41", 
    icon: RefreshCcw, 
    trend: "stable", 
    color: "text-blue-500",
    bg: "bg-blue-50 text-blue-600"
  },
  { 
    label: "Team Availability", 
    value: "82%", 
    icon: Users2, 
    trend: "positive", 
    color: "text-green-500",
    bg: "bg-green-50 text-green-600"
  },
];

const workerStats = [
  { 
    label: "Assigned Tasks", 
    value: "12", 
    icon: ClipboardCheck, 
    trend: "on-track", 
    color: "text-blue-500",
    bg: "bg-blue-50 text-blue-600"
  },
  { 
    label: "Completion Rate", 
    value: "94%", 
    icon: Target, 
    trend: "positive", 
    color: "text-green-500",
    bg: "bg-green-50 text-green-600"
  },
  { 
    label: "Pending Review", 
    value: "03", 
    icon: Clock, 
    trend: "stable", 
    color: "text-orange-500",
    bg: "bg-orange-50 text-orange-600"
  },
  { 
    label: "Current Status", 
    value: "Available", 
    icon: CalendarCheck, 
    trend: "active", 
    color: "text-emerald-500",
    bg: "bg-emerald-50 text-emerald-600"
  },
];

const teamWorkload = [
  { name: "Sarah Connor", role: "Ops Lead", load: 95, status: "heavy" },
  { name: "Amir Khan", role: "Developer", load: 40, status: "light" },
  { name: "Lena Meyer", role: "Developer", load: 65, status: "moderate" },
  { name: "Priya Singh", role: "Designer", load: 85, status: "heavy" },
  { name: "Marcus Wright", role: "Ops", load: 30, status: "light" },
  { name: "Jessica Day", role: "DevOps", load: 55, status: "moderate" },
];

const recentActivity = [
  { id: 1, text: "OPS-482 moved from Amir to Lena", time: "12m ago", note: "Manager approved after schedule check", type: "reassign" },
  { id: 2, text: "DES-320 moved from Priya to Marcus", time: "45m ago", note: "Capacity adjustment for Sarah's OOO", type: "reassign" },
  { id: 3, text: "System Alert: Network latency detected", time: "1h ago", note: "Auto-rebalancing tasks to cloud nodes", type: "system" },
];

export default function DashboardPage() {
  const { role } = useRoleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentStats = role === "manager" ? stats : workerStats;

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* 1. Page Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-medium">
            {role === "manager" 
              ? "Your team’s resilience and workload overview" 
              : "Overview of your personal performance and task status"}
          </p>
        </header>

        {/* 2. Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentStats.map((item) => (
            <article
              key={item.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-4xl font-bold text-sidebar">{item.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${item.bg}`}>
                  <item.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                {role === "manager" ? (
                  <>
                    <span className={item.color}>
                      {item.trend === "positive" ? "↑ 12%" : item.trend === "increase" ? "↑ 5%" : "Stable"}
                    </span>
                    <span className="text-muted-foreground">vs last 24h</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Updated just now</span>
                )}
              </div>
            </article>
          ))}
        </div>

        {role === "manager" ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 3. Team Workload grid */}
          <section className="xl:col-span-2 rounded-2xl border border-border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-sidebar">Team Workload</h2>
                <p className="text-sm text-muted-foreground">Capacity and burnout monitoring</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"/>Light</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"/>Mod</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"/>Heavy</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamWorkload.map((member) => (
                <div 
                  key={member.name}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-bold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-sidebar flex items-center gap-2">
                        {member.name}
                        {member.status === 'heavy' && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-[10px] text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            Burnout Risk
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${member.status === 'heavy' ? 'text-red-500' : member.status === 'moderate' ? 'text-orange-500' : 'text-green-500'}`}>
                      {member.load}%
                    </p>
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${member.status === 'heavy' ? 'bg-red-500' : member.status === 'moderate' ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${member.load}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Activity Feed */}
          <section className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-sidebar mb-6 flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activities
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="relative pl-10 group cursor-pointer">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-sidebar-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                    {activity.type === 'reassign' ? <RefreshCcw className="h-4 w-4 text-sidebar-primary" /> : <Info className="h-4 w-4 text-sidebar-primary" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-sidebar">{activity.text}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{activity.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{activity.note}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 5. Personal Progress */}
            <section className="rounded-2xl border border-border bg-white p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Target className="h-16 w-16 text-emerald-50 opacity-10" />
              </div>
              <h2 className="text-xl font-bold text-sidebar mb-6">Current Sprint Progress</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-sidebar">Sprint #24 Goals</span>
                    <span className="text-2xl font-black text-sidebar">78%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 w-[78%] rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 rounded-xl bg-gray-50 border border-border">
                    <p className="text-xl font-bold text-sidebar">9</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Done</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50 border border-border">
                    <p className="text-xl font-bold text-sidebar">2</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">In Review</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50 border border-border">
                    <p className="text-xl font-bold text-sidebar">1</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Blocked</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Upcoming Priorities */}
            <section className="rounded-2xl border border-border bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-sidebar mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-sidebar-primary" />
                Upcoming Deadlines
              </h2>
              <div className="space-y-4">
                {[
                  { task: "Finish frontend unit tests", deadline: "Today, 5pm", priority: "high" },
                  { task: "Update documentation", deadline: "Tomorrow, 12pm", priority: "medium" },
                  { task: "Sprint retrospective", deadline: "Friday, 10am", priority: "medium" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'}`} />
                      <p className="text-sm font-bold text-sidebar">{item.task}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground bg-gray-100 px-2 py-1 rounded-md">
                      {item.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
