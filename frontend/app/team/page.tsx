"use client";

import { AppShell } from "../_components/app-shell";
import { TeamHealthDistribution } from "../_components/TeamHealthDistribution";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <AppShell>
      <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Team Overview
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Monitor team workload, active task distribution, and resilience history.
          </p>
        </header>

        <section>
          <TeamHealthDistribution />
        </section>
      </div>
    </AppShell>
  );
}
