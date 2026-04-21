"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import {
  Bot,
  Bell,
  ChartColumn,
  GitBranchPlus,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Library,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/task-adjustments", label: "Task Adjustments", icon: GitBranchPlus },
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
  // Initialize from localStorage if available, otherwise default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const teamActive = pathname.startsWith("/team");

  return (
    <aside 
      className={`flex h-screen flex-col justify-between bg-sidebar p-5 text-sidebar-foreground transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-[4px] bg-sidebar px-2 py-2">
          {!isCollapsed && (
            <p className="text-sm font-bold tracking-tight">Zenius AI</p>
          )}
          <button
            onClick={handleToggle}
            className="rounded-md p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ml-auto"
            title={isCollapsed ? "Open sidebar" : "Highlight sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
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
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>

                {/* {item.href === "/team" && teamActive && !isCollapsed ? (
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
                ) : null} */}
              </div>
            );
          })}
        </nav>
      </div>

      <button 
        className={`flex items-center gap-2 rounded-[4px] px-3 py-2 text-left text-sm transition-all ${
          isCollapsed 
            ? "justify-center w-fit mx-auto bg-sidebar text-secondary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" 
            : "w-full bg-sidebar text-secondary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span>Log out</span>}
      </button>
    </aside>
  );
}
