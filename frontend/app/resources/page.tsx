"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../_components/app-shell";
import { useRoleStore } from "../_store/role-store";
import { 
  Search, 
  Mic, 
  MessageSquare,
  Settings2
} from "lucide-react";

// Official Brand Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlack, faJira, faTrello } from '@fortawesome/free-brands-svg-icons';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

const integrations = [
  {
    id: "jira",
    name: "Jira",
    logo: <FontAwesomeIcon icon={faJira} className="h-6 w-6" />,
    description: "Project management tasks and issue tracking from Jira.",
    status: "Not Connected",
    color: "text-[#0052CC]",
  },
  {
    id: "trello",
    name: "Trello",
    logo: <FontAwesomeIcon icon={faTrello} className="h-6 w-6" />,
    description: "Collaborative boards and cards for task management.",
    status: "Not Connected",
    color: "text-[#0079BF]",
  },
  {
    id: "slack",
    name: "Slack",
    logo: <FontAwesomeIcon icon={faSlack} className="h-6 w-6" />,
    description: "Team communication and real-time messaging integration.",
    status: "Not Connected",
    color: "text-[#4A154B]",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    logo: <FontAwesomeIcon icon={faUserGroup} className="h-6 w-6" />,
    description: "Enterprise communication and collaboration workspace.",
    status: "Not Connected",
    color: "text-[#6264A7]",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    logo: <MessageSquare className="h-6 w-6" />,
    description: "Automated aggregation of meeting summaries and action items.",
    status: "Not Connected",
    color: "text-emerald-600",
  },
  {
    id: "audio-transcript",
    name: "Audio Transcript",
    logo: <Mic className="h-6 w-6" />,
    description: "Speech-to-text conversion for all recorded meetings.",
    status: "Not Connected",
    color: "text-rose-600",
  },
];

export default function ResourcesPage() {
  const { role } = useRoleStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredIntegrations = integrations.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Resources & Integrations</h1>
          <p className="text-muted-foreground font-medium">
            {role === "manager" 
              ? "Manage your connected apps and synchronize data across your entire team workflow."
              : "View available integrations and apps currently linked to your workspace."}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search integrations..."
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((app) => (
            <div 
              key={app.id} 
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-slate-50 ${app.color} group-hover:scale-110 transition-transform`}>
                  {app.logo}
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  app.status === "Connected" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${app.status === "Connected" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {app.status}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0F172A]">{app.name}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {app.description}
                </p>
              </div>

              {role === "manager" && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                  <button className="flex-1 bg-[#2D4A3E] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#1F332A] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {app.status === "Connected" ? "Manage Integration" : "Connect App"}
                  </button>
                  {app.status === "Connected" && (
                    <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all">
                      <Settings2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-20 text-muted-foreground italic">
            No integrations found matching your search.
          </div>
        )}
      </div>
    </AppShell>
  );
}

