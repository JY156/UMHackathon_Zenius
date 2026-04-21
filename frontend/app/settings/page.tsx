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
  LogOut,
  ChevronRight,
  Monitor,
  Globe,
  Database,
  Key
} from "lucide-react";

export default function SettingsPage() {
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("johndoe@zenius.ai");
  const [role] = useState("Platform Manager");
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    push: false
  });

  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Settings</h1>
          <p className="text-[#64748B] text-sm">Manage your workspace preferences and security</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          
          {/* Main Content Area */}
          <div className="space-y-8">
            
            {/* Profile Card */}
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-semibold text-[#0F172A]">Public Profile</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-lg text-sm font-bold hover:bg-[#1F332A] transition-all shadow-sm active:scale-95">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Avatar Row */}
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
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        value={role}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#F1F5F9] bg-slate-50/50">
                <h2 className="text-lg font-semibold text-[#0F172A]">Notification Preferences</h2>
              </div>
              <div className="p-6 divide-y divide-slate-100">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts' },
                  { key: 'inApp', label: 'In-App Alerts', desc: 'Real-time updates within the dashboard' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser notifications for direct mentions' },
                ].map((pref) => (
                  <div key={pref.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">{pref.label}</p>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof notifications] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                        notifications[pref.key as keyof typeof notifications] ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        notifications[pref.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 text-slate-900 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Key size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Privacy & Security</h2>
                  <p className="text-slate-500 text-xs text-balance">Ensure your data and credentials stay protected</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-sm transition-all text-slate-700">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} />
                    Two-Factor Authentication
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Enabled</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-sm transition-all text-slate-700">
                  <div className="flex items-center gap-3">
                    <Lock size={16} />
                    Change Password
                  </div>
                  <ChevronRight size={16} className="opacity-40" />
                </button>
              </div>
            </section>

            {/* Sign Out Section */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button className="flex items-center gap-3 px-6 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all border border-rose-100">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
