import { AppShell } from "../_components/app-shell";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Analytics</h1>

        <div className="grid grid-cols-2 gap-3">
          <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Burnout Risk Trend</h2>
            <div className="mt-4 flex h-28 items-end gap-1">
              {[42, 58, 71, 53].map((height) => (
                <div
                  key={height}
                  className="w-full rounded-[4px] bg-primary"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Workload Distribution</h2>
            <div className="mt-4 h-24 w-24 rounded-full border-[12px] border-primary" />
          </section>
        </div>

        <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Task Completion Rate</h2>
          <div className="mt-3 h-3 rounded-[4px] bg-muted">
            <div className="h-3 w-3/4 rounded-[4px] bg-primary" />
          </div>
        </section>

        <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Absence Patterns (Calendar Heatmap)</h2>
          <div className="mt-3 flex gap-1">
            <div className="h-5 flex-1 rounded-[4px] bg-muted" />
            <div className="h-5 flex-1 rounded-[4px] bg-accent" />
            <div className="h-5 flex-1 rounded-[4px] bg-primary" />
            <div className="h-5 flex-1 rounded-[4px] bg-foreground" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
