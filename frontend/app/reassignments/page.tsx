import { AppShell } from "../_components/app-shell";

export default function ReassignmentsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Reassignments</h1>

        <div className="grid grid-cols-2 gap-3">
          <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
            <p className="font-caption text-sm text-muted-foreground">Before</p>
            <p className="mt-1 text-sm">Assignee: Amir | Load: 94% | 5 blockers</p>
          </section>

          <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
            <p className="font-caption text-sm text-muted-foreground">After</p>
            <p className="mt-1 text-sm">Assignee: Lena | Load: 71% | blockers cleared</p>
          </section>
        </div>

        <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">AI Explanation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Model considered current sprint commitments, delivery risk, and skill overlap from previous Jira throughput.
          </p>
        </section>

        <button className="rounded-[4px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
          Open Approval Modal
        </button>

        <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Reassignment History Log</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>09:21 - OPS-482 approved and synced to Jira</li>
            <li>09:10 - MKT-102 rejected by manager</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
