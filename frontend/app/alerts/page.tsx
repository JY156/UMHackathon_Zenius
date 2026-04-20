import { AppShell } from "../_components/app-shell";

export default function AlertsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Alerts</h1>

        <div className="flex gap-2">
          {["Status: Pending", "Type: Absence", "Date: Last 7 days"].map((filter) => (
            <span
              key={filter}
              className="font-caption rounded-[4px] bg-secondary px-3 py-2 text-xs text-muted-foreground"
            >
              {filter}
            </span>
          ))}
        </div>

        <section className="min-h-[420px] rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <article className="rounded-[4px] bg-secondary p-3">
            <p className="text-sm font-semibold">Employee: Sarah Lim | Sick Leave | 6 affected tasks</p>
            <p className="mt-1 text-xs text-muted-foreground">
              AI Recommendation: Assign sprint tickets to Lena + Wei based on velocity and skill fit.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-[4px] bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Approve
              </button>
              <button className="rounded-[4px] bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                Reject
              </button>
              <button className="rounded-[4px] bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                Reassign Manually
              </button>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
