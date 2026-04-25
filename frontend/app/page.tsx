"use client";

import { useState } from "react";
import { AppShell } from "./_components/app-shell";
import { AgentCommandCenter } from "./_components/AgentCommandCenter";
import { TeamHealthDistribution } from "./_components/TeamHealthDistribution";
import { LayoutDashboard, Users2, Workflow } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"command" | "health">("command");

  return (
    <AppShell>
      <div className="space-y-6 pb-10">
        <header className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Workflow className="w-8 h-8 text-primary" />
              Zenius Engine
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Agentic Workflow Engine for Resilient Team Orchestration
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 w-fit">
            <button
              onClick={() => setActiveTab("command")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === "command"
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-900/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Agent Command Center
            </button>
            <button
              onClick={() => setActiveTab("health")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === "health"
                  ? "bg-white text-primary shadow-sm ring-1 ring-slate-900/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <Users2 className="w-4 h-4" />
              Team Health & Distribution
            </button>
          </div>
        </header>

        {/* Render Tab Content */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "command" ? <AgentCommandCenter /> : <TeamHealthDistribution />}
        </section>
      </div>
    </AppShell>
  );
}
