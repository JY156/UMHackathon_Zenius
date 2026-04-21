import { AppShell } from "./_components/app-shell";
import { 
  Bell, 
  CheckCircle2, 
  RefreshCcw, 
  Users2, 
  AlertTriangle,
  ClipboardCheck,
  History,
  Info
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
  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* 1. Page Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-medium">Your team’s resilience and workload overview</p>
        </header>

        {/* 2. Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
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
                <span className={item.color}>
                  {item.trend === "positive" ? "↑ 12%" : item.trend === "increase" ? "↑ 5%" : "Stable"}
                </span>
                <span className="text-muted-foreground">vs last 24h</span>
              </div>
            </article>
          ))}
        </div>

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
      </div>
    </AppShell>
  );
}
