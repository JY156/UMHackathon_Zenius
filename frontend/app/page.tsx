"use client";

import Link from "next/link";
import { AppShell } from "./_components/app-shell";
import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ListTodo, Users2 } from "lucide-react";

type TaskStatus = "Not started" | "In Progress" | "Completed";

type TaskItem = {
  id: string;
  title: string;
  assignee: string;
  workload: number;
  status: TaskStatus;
};

type Project = {
  id: string;
  name: string;
  tasks: TaskItem[];
};

const projects: Project[] = [
  {
    id: "project-apollo",
    name: "Apollo CRM Migration",
    tasks: [
      { id: "apollo-1", title: "Map legacy fields to CRM schema", assignee: "Lena Meyer", workload: 62, status: "In Progress" },
      { id: "apollo-2", title: "Build import validation script", assignee: "Marcus Wright", workload: 48, status: "Not started" },
      { id: "apollo-3", title: "Sign off migration readiness", assignee: "Sarah Connor", workload: 70, status: "Completed" },
    ],
  },
  {
    id: "project-orbit",
    name: "Orbit Launch Readiness",
    tasks: [
      { id: "orbit-1", title: "Prepare partner onboarding checklist", assignee: "Priya Singh", workload: 54, status: "In Progress" },
      { id: "orbit-2", title: "Review manager email action items", assignee: "Amir Khan", workload: 45, status: "Completed" },
      { id: "orbit-3", title: "Resolve deployment blockers", assignee: "Jessica Day", workload: 63, status: "Not started" },
    ],
  },
  {
    id: "project-nova",
    name: "Nova Support Automation",
    tasks: [
      { id: "nova-1", title: "Tag incoming support email intents", assignee: "Wei Zhang", workload: 58, status: "In Progress" },
      { id: "nova-2", title: "Auto-route urgent tickets", assignee: "Noah Patel", workload: 44, status: "Completed" },
      { id: "nova-3", title: "Update escalation SLA matrix", assignee: "Emily Chen", workload: 52, status: "Not started" },
    ],
  },
];

export default function DashboardPage() {
  const [selectedKpi, setSelectedKpi] = useState<"total" | "workload" | "completion" | null>(null);

  const metrics = useMemo(() => {
    const taskList = projects.flatMap((project) => project.tasks);
    const totalTasksAssigned = taskList.length;
    const completionCount = taskList.filter((task) => task.status === "Completed").length;
    const inProgressCount = taskList.filter((task) => task.status === "In Progress").length;
    const completionRate = Math.round((completionCount / totalTasksAssigned) * 100);
    const averageWorkload = Math.round(taskList.reduce((sum, task) => sum + task.workload, 0) / totalTasksAssigned);

    return {
      totalTasksAssigned,
      completionRate,
      averageWorkload,
      inProgressCount,
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-8 pb-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Email-only integration is active. Backend auto-detects tasks and workload from manager emails and maps assignments by skill fit.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/task-adjustments"
            onClick={() => setSelectedKpi("total")}
            className={`rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selectedKpi === "total" ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total Tasks Assigned</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metrics.totalTasksAssigned}</p>
              </div>
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              View all projects <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </Link>

          <Link
            href="/task-adjustments#workload-projects"
            onClick={() => setSelectedKpi("workload")}
            className={`rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selectedKpi === "workload" ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workload Distribution</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metrics.averageWorkload}%</p>
              </div>
              <Users2 className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              Jump to workload cards <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </Link>

          <Link
            href="/task-adjustments#completion-projects"
            onClick={() => setSelectedKpi("completion")}
            className={`rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              selectedKpi === "completion" ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Completion Rate</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metrics.completionRate}%</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              See completion by project <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </Link>

          <Link
            href="/task-adjustments"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Projects Tracked</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{projects.length}</p>
              </div>
              <BriefcaseBusiness className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
              Open Task Assignments <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Project Snapshot</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Task assignment decisions are generated from manager email signals, workload balancing, and skill-match confidence.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/task-adjustments#${project.id}`}
                className="rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <p className="text-sm font-bold text-foreground">{project.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{project.tasks.length} assigned tasks</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
