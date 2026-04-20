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
      <section className="h-screen flex-1 overflow-y-auto p-6">
        <header className="mb-4 flex items-center justify-between rounded-[6px] border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 rounded-[4px] bg-secondary px-3 py-2 text-xs text-muted-foreground">
            <Search className="h-4 w-4" />
            <span className="font-caption">Search alerts, members, tasks...</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Bell className="h-4 w-4" />
            <Moon className="h-4 w-4" />
            <UserCircle2 className="h-5 w-5" />
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
