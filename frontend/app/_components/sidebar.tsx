"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, type ComponentType } from "react";
import { useRoleStore } from "../_store/role-store";
import {
  GitBranchPlus,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles?: ("manager" | "worker")[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/task-adjustments", label: "Task Assignments", icon: GitBranchPlus },
  { href: "/team", label: "Team", icon: Users },
  { href: "/approvals", label: "Approvals", icon: ShieldAlert },
];

const teamSubItems = ["Engineering", "Product & Design", "Operations"];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRoleStore();
  const [mounted, setMounted] = useState(false);
  // Initialize from localStorage if available, otherwise default to false
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const teamActive = pathname.startsWith("/team");

  // If not mounted, render a shell or null to avoid hydration mismatch
  if (!mounted) {
    return (
      <aside className="flex h-screen w-[260px] flex-col bg-sidebar p-5" />
    );
  }

  return (
    <aside 
      className={`flex h-screen flex-col justify-between bg-sidebar p-5 text-sidebar-foreground transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-[4px] bg-sidebar px-2 py-2">
          {!isCollapsed && (
            <div className="flex flex-col">
              <p className="text-sm font-bold tracking-tight">Zenius AI</p>
              <p className="text-[10px] uppercase font-bold text-sidebar-foreground/50 tracking-widest">{role}</p>
            </div>
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
                  prefetch={false}
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
