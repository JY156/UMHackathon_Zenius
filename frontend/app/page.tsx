"use client";

import { AppShell } from "./_components/app-shell";
import { ManagerDashboard } from "./_components/ManagerDashboard";
import { WorkerDashboard } from "./_components/WorkerDashboard";
import { useRoleStore } from "./_store/role-store";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { role } = useRoleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AppShell>
        <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {role === "manager" ? <ManagerDashboard /> : <WorkerDashboard />}
    </AppShell>
  );
}
