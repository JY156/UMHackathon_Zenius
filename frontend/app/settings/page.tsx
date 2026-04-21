"use client";

import { useState } from "react";
import { AppShell } from "../_components/app-shell";
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Moon, 
  Bell, 
  ShieldCheck, 
  Smartphone, 
  Download, 
  EyeOff, 
  Info, 
  FileText, 
  MessageSquarePlus,
  Save,
  LogOut
} from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@zenius.ai");
  const [role] = useState("Manager"); // Read-only
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    push: false
  });
  const [privacy, setPrivacy] = useState({
    showWorkload: true,
    showStress: false
  });

  return (
    <AppShell>
      <div className="flex-1 space-y-10 p-8 max-w-5xl mx-auto font-sans">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-sidebar-accent-foreground font-serif">Settings</h1>
          <p className="text-muted-foreground font-sans">
            Manage your account settings, preferences, and system configurations.
          </p>
        </div>

        {/* 1. Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <User className="h-5 w-5 text-sidebar-primary" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center space-y-4 p-6 rounded-xl border border-dashed border-border bg-gray-50/50">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full bg-sidebar-primary/10 flex items-center justify-center border-2 border-sidebar-primary overflow-hidden">
                  <User className="h-12 w-12 text-sidebar-primary" />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-sidebar-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">{role}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Primary Role</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email Address</label>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary outline-none"
                  />
                  <button className="px-3 py-1 text-xs font-semibold bg-sidebar-accent text-sidebar-accent-foreground rounded-md border border-sidebar-border hover:bg-sidebar-primary/10">
                    Verify
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold text-sidebar-primary hover:underline">
                <Lock className="h-4 w-4" />
                Change Password
              </button>
            </div>
          </div>
        </section>

        {/* 2. Preferences Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Bell className="h-5 w-5 text-sidebar-primary" />
            <h2 className="text-xl font-semibold">Preferences</h2>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 space-y-4">
            <p className="font-semibold flex items-center gap-2">
              Notification Delivery
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['email', 'inApp', 'push'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={(notifications as any)[type]} 
                    onChange={() => setNotifications(prev => ({ ...prev, [type]: !(prev as any)[type] }))}
                    className="w-4 h-4 rounded border-gray-300 text-sidebar-primary focus:ring-sidebar-primary"
                  />
                  <span className="text-sm capitalize text-muted-foreground group-hover:text-foreground transition-colors">{type === 'inApp' ? 'In-App' : type}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 4. System & Advanced */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Info className="h-5 w-5 text-sidebar-primary" />
            <h2 className="text-xl font-semibold">System & Advanced</h2>
          </div>

          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Application Version</p>
                  <code className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-mono">v1.5.15-stable (Build 2026.04.21)</code>
                </div>
                <button className="flex items-center gap-2 text-sm p-2 rounded border border-border bg-secondary hover:bg-muted transition-colors w-full justify-center">
                  <FileText className="h-4 w-4" />
                  Open Error Log Viewer
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm font-bold flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4" />
                  Submit Feedback
                </p>
                <textarea 
                  placeholder="Tell us what you think or report a bug..."
                  className="w-full h-24 rounded-md border border-input bg-background p-3 text-sm focus:ring-1 focus:ring-sidebar-primary outline-none resize-none"
                ></textarea>
                <button className="w-full bg-sidebar-primary text-sidebar-primary-foreground py-2 rounded-md text-sm font-semibold hover:opacity-90">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex items-center justify-end pt-10 border-t border-border mt-10">
          <button className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 hover:-translate-y-0.5 transition-all">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
