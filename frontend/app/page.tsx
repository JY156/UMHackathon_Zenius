import { AppShell } from "./_components/app-shell";

const stats = [
  { label: "Total Alerts", value: "27" },
  { label: "Pending Approvals", value: "8" },
  { label: "Tasks Reassigned Today", value: "41" },
  { label: "Team Availability %", value: "82%" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-[6px] border border-border bg-card p-3 shadow-sm"
            >
              <p className="font-caption text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <section className="col-span-2 rounded-[6px] border border-border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Team Workload Heatmap</h2>
            <div className="mt-3 flex gap-2">
              <div className="h-3 flex-1 rounded-[4px] bg-muted" />
              <div className="h-3 flex-1 rounded-[4px] bg-accent" />
              <div className="h-3 flex-1 rounded-[4px] bg-primary" />
            </div>
            <div className="mt-4 rounded-[4px] bg-secondary p-3">
              <p className="text-sm text-muted-foreground">
                Sarah OOO - 4 critical tasks impacted
              </p>
            </div>
          </section>

          <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Recent Reassignments</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>OPS-482 moved from Amir to Lena</li>
              <li>DES-320 moved from Priya to Marcus</li>
              <li>Manager approved after schedule check</li>
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
