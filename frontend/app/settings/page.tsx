import { AppShell } from "../_components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Settings</h1>
        <section className="rounded-[6px] border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Workspace Preferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure notifications, approval policy, and AI recommendation thresholds.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
