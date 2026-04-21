import type { ReactNode } from "react";
import { Bell, Moon, Search, UserCircle2 } from "lucide-react";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <section className="h-screen flex-1 overflow-y-auto p-8 pt-10">
        {children}
      </section>
    </main>
  );
}
