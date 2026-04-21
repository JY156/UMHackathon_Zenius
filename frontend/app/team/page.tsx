"use client";

import { useState } from "react";
import { AppShell } from "../_components/app-shell";
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Circle,
  ChevronRight,
  X,
  SortAsc,
  Users2,
  Calendar
} from "lucide-react";

const teamMembers = [
  { 
    id: 1, 
    name: "Lena Chong", 
    role: "Backend Engineer", 
    status: "Online", 
    team: "Engineering", 
    email: "lena.chong@zenius.ai", 
    phone: "+60 12-345 6789",
    joined: "2023-01-15"
  },
  { 
    id: 2, 
    name: "Amir Rahman", 
    role: "Platform Engineer", 
    status: "Offline", 
    team: "Engineering", 
    email: "amir.rahman@zenius.ai", 
    phone: "+60 12-987 6543",
    joined: "2023-03-20"
  },
  { 
    id: 3, 
    name: "Sarah Oh", 
    role: "Lead Designer", 
    status: "Online", 
    team: "Product & Design", 
    email: "sarah.oh@zenius.ai", 
    phone: "+60 11-234 5678",
    joined: "2022-11-05"
  },
  { 
    id: 4, 
    name: "Wei Lynn", 
    role: "Ops Manager", 
    status: "Online", 
    team: "Operations", 
    email: "wei.lynn@zenius.ai", 
    phone: "+60 17-888 9999",
    joined: "2024-02-10"
  },
  { 
    id: 5, 
    name: "Marcus Tan", 
    role: "IT Specialist", 
    status: "Offline", 
    team: "IT", 
    email: "marcus.tan@zenius.ai", 
    phone: "+60 19-777 6666",
    joined: "2023-08-12"
  },
];

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [activeTeam, setActiveTeam] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");

  const filteredMembers = teamMembers.filter(m => {
    const teamMatch = activeTeam === "All" || m.team === activeTeam;
    const statusMatch = activeStatus === "All" || m.status === activeStatus;
    return teamMatch && statusMatch;
  });

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* 1. Page Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground font-medium">Manage members and view details</p>
        </header>

        {/* 2. Filters (Top Bar) */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-gray-50/50 text-xs font-semibold">
            <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
            <select 
              className="bg-transparent focus:outline-none"
              value={activeTeam}
              onChange={(e) => setActiveTeam(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Operations">Operations</option>
              <option value="IT">IT</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-gray-50/50 text-xs font-semibold">
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
            <select 
              className="bg-transparent focus:outline-none"
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-gray-50/50 text-xs font-semibold">
            <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
            <select className="bg-transparent focus:outline-none">
              <option>Sort: A to Z</option>
              <option>First Join</option>
              <option>Last Join</option>
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search members..."
              className="w-full bg-gray-50/50 border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sidebar-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 3. Member List (Main Section) */}
          <section className="flex-1 space-y-2">
            <div className="grid grid-cols-12 px-6 py-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-4">Member</div>
              <div className="col-span-4">Position</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1"></div>
            </div>
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`w-full grid grid-cols-12 items-center px-6 py-4 rounded-xl border transition-all text-left group ${
                    selectedMember?.id === member.id 
                      ? "bg-sidebar-primary/5 border-sidebar-primary/20 shadow-sm" 
                      : "bg-white border-border hover:border-sidebar-primary/30 hover:shadow-sm"
                  }`}
                >
                  <div className="col-span-1">
                    <div className="w-10 h-10 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary font-bold text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <p className="font-bold text-sidebar text-sm">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{member.team}</p>
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm text-sidebar font-medium">{member.role}</p>
                  </div>
                  <div className="col-span-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      member.status === "Online" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                      <Circle className={`h-2 w-2 ${member.status === "Online" ? "fill-emerald-500 text-emerald-500" : "fill-gray-400 text-gray-400"}`} />
                      {member.status}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 ${selectedMember?.id === member.id ? 'translate-x-1' : ''}`} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 4. Member Detail Panel */}
          {selectedMember && (
            <aside className="lg:w-[380px] shrink-0 animate-in slide-in-from-right-4 duration-300">
              <div className="sticky top-10 rounded-2xl border border-border bg-white shadow-lg overflow-hidden">
                <div className="bg-sidebar p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={() => setSelectedMember(null)}
                      className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/5 flex items-center justify-center text-white text-3xl font-bold mb-4 mx-auto backdrop-blur-sm">
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute bottom-5 right-1 w-5 h-5 rounded-full border-4 border-sidebar ${selectedMember.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedMember.name}</h3>
                  <p className="text-sidebar-foreground/70 text-sm font-medium">{selectedMember.role}</p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-muted-foreground group-hover:bg-sidebar-primary/10 group-hover:text-sidebar-primary transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Email Address</p>
                        <p className="text-sm font-bold text-sidebar">{selectedMember.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-muted-foreground group-hover:bg-sidebar-primary/10 group-hover:text-sidebar-primary transition-colors">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Contact Number</p>
                        <p className="text-sm font-bold text-sidebar">{selectedMember.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-muted-foreground group-hover:bg-sidebar-primary/10 group-hover:text-sidebar-primary transition-colors">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Department</p>
                        <p className="text-sm font-bold text-sidebar">{selectedMember.team}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-muted-foreground group-hover:bg-sidebar-primary/10 group-hover:text-sidebar-primary transition-colors">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Joined Date</p>
                        <p className="text-sm font-bold text-sidebar">{selectedMember.joined}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <button className="w-full bg-sidebar-primary text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm shadow-sidebar-primary/20">
                      Message {selectedMember.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  );
}
