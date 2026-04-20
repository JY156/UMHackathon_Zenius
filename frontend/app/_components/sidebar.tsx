"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  Bot,
  Bell,
  ChartColumn,
  GitBranchPlus,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/reassignments", label: "Reassignments", icon: GitBranchPlus },
  { href: "/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/team", label: "Team", icon: Users },
  { href: "/ai-agent", label: "AI Agent", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const teamSubItems = ["Engineering", "Product & Design", "Operations"];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const teamActive = pathname.startsWith("/team");

  return (
    <aside className="flex h-screen w-[260px] flex-col justify-between bg-sidebar p-5 text-sidebar-foreground">
      <div className="space-y-4">
        <div className="rounded-[4px] bg-sidebar px-2 py-2">
          <p className="text-sm font-bold tracking-tight">ZenWork AI</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-[4px] px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "bg-sidebar text-secondary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>

                {item.href === "/team" && teamActive ? (
                  <div className="space-y-1 pl-5 pt-2">
                    {teamSubItems.map((subItem, idx) => (
                      <p
                        key={subItem}
                        className={`font-caption text-xs ${
                          idx === 0
                            ? "font-semibold text-sidebar-foreground"
                            : "text-secondary"
                        }`}
                      >
                        {subItem}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <button className="flex w-full items-center gap-2 rounded-[4px] bg-sidebar-primary px-3 py-2 text-left text-sm font-semibold text-sidebar-primary-foreground">
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
