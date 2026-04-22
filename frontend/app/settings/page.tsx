"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../_components/app-shell";
import { useRoleStore, UserRole } from "../_store/role-store";
import toast from "react-hot-toast";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Camera,
  Save,
  ChevronRight,
  Monitor,
  Globe,
  Database,
  Key,
  Briefcase,
  Users,
  Info,
  Smartphone,
  LogOut,
  Sparkles,
  Clock,
  RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const { role: storeRole, setRole } = useRoleStore();
  const [mounted, setMounted] = useState(false);
  
  // Profile state
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@zenius.ai");
  const [password, setPassword] = useState("********");
  
  // Preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    push: false
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== storeRole) {
      setRole(newRole);
      toast.success(`Role switched to ${newRole}`, {
        icon: <RefreshCw size={16} className="text-emerald-500 animate-spin-slow" />,
        style: {
          borderRadius: '12px',
          background: '#FFFFFF',
          color: '#0F172A',
          border: '1px solid #E2E8F0',
          fontSize: '14px',
          fontWeight: '600',
        },
      });
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully", {
      style: {
        borderRadius: '12px',
        background: '#FFFFFF',
        color: '#0F172A',
        border: '1px solid #E2E8F0',
        fontSize: '14px',
        fontWeight: '600',
      },
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    const newVal = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newVal }));
    toast.success(`${key} notifications ${newVal ? 'enabled' : 'disabled'}`, {
      style: {
        borderRadius: '12px',
        background: '#FFFFFF',
        color: '#0F172A',
        border: '1px solid #E2E8F0',
        fontSize: '14px',
        fontWeight: '600',
      },
    });
  };

  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Settings</h1>
          <p className="text-[#64748B] text-sm font-medium">Manage your account, role, and notifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="md:col-span-8 space-y-8">

            {/* Role Switch Section */}
            <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden ring-4 ring-emerald-50/50">
              <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">Role Configuration</h2>
                    <p className="text-xs text-slate-500">Switch workspace view permissions</p>
                  </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => handleRoleChange("manager")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${storeRole === 'manager' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Manager
                  </button>
                  <button 
                    onClick={() => handleRoleChange("worker")}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${storeRole === 'worker' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Worker
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="p-1 bgColor-emerald-500 rounded text-white flex items-center justify-center">
                    <Info size={14} />
                  </div>
                  <p>Currently viewing as <span className="font-bold text-emerald-700 uppercase tracking-wide">{storeRole}</span>. This reconfigures dashboards and permissions.</p>
                </div>
              </div>
            </section>
            
            {/* Profile Card */}
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#F1F5F9] flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <User size={20} />
                </div>
                <h2 className="text-lg font-semibold text-[#0F172A]">User Profile</h2>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#2D4A3E] text-3xl font-bold border-2 border-white shadow-md overflow-hidden ring-4 ring-emerald-50">
                      JD
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 transition-colors">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#0F172A]">Profile Picture</h3>
                    <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size 2MB.</p>
                    <div className="flex gap-2 pt-2">
                       <button className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors">Change Photo</button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-[#2D4A3E] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1F332A] transition-all shadow-sm active:scale-[0.98]">
                      <Save size={16} />
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Preferences / Notifications */}
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#F1F5F9] flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <Bell size={20} />
                </div>
                <h2 className="text-lg font-semibold text-[#0F172A]">Notifications & Privacy</h2>
              </div>
              
              <div className="p-6 divide-y divide-[#F1F5F9]">
                <div className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Email Notifications</h4>
                    <p className="text-xs text-slate-500">Receive weekly summary and alerts via email</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification('email')}
                    className={`w-12 h-6 rounded-full transition-all relative ${notifications.email ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.email ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">In-App Alerts</h4>
                    <p className="text-xs text-slate-500">Enable real-time dashboard notifications</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification('inApp')}
                    className={`w-12 h-6 rounded-full transition-all relative ${notifications.inApp ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.inApp ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">Browser Push</h4>
                    <p className="text-xs text-slate-500">Receive desktop notifications when assigned a task</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification('push')}
                    className={`w-12 h-6 rounded-full transition-all relative ${notifications.push ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications.push ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm ring-4 ring-emerald-50/50 space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-[#0F172A]">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                  <Sparkles size={16} />
                </div>
                Prototyping Tips
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Use the <strong className="text-emerald-600">Role Switch</strong> above to see how AI Agent recommendations and Analytics dashboards change instantly for different team members.
              </p>
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                   <div className="w-2 h-2 rounded-full bg-emerald-400" />
                   <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Manager: Approvals & Team Stats</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                   <div className="w-2 h-2 rounded-full bg-emerald-400" />
                   <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Worker: Personal Stats & AI Assist</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700">Security Audit</h3>
              <div className="space-y-3">
                {[
                   { label: "IP Address", val: "192.168.1.1", icon: Globe },
                   { label: "Last Login", val: "2 mins ago", icon: Clock },
                   { label: "OAuth Sync", val: "Active", icon: Key }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Icon size={14} />
                      {item.label}
                    </div>
                    <span className="font-bold text-slate-600">{item.val}</span>
                  </div>
                  );
                })}
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-100 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all">
                <LogOut size={18} />
                Sign Out
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
