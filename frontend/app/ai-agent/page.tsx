import { AppShell } from "../_components/app-shell";

export default function AiAgentPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">AI Agent</h1>
        <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Agent Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review recommendations, run simulation reassignments, and sync approved moves to Jira/Trello.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
