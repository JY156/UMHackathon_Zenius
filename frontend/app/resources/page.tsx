"use client";

import { useState } from "react";
import { AppShell } from "../_components/app-shell";
import { 
  Search, 
  FileText, 
  Mic, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  LayoutPanelLeft,
  Users2,
  Square
} from "lucide-react";

const integrations = [
  {
    id: "jira",
    name: "Jira",
    logo: LayoutPanelLeft,
    description: "Project management tasks and issue tracking from Jira.",
    status: "Connected",
    color: "text-blue-600",
  },
  {
    id: "trello",
    name: "Trello",
    logo: Square,
    description: "Collaborative boards and cards for task management.",
    status: "Not Connected",
    color: "text-sky-500",
  },
  {
    id: "slack",
    name: "Slack",
    logo: Square,
    description: "Team communication and real-time messaging integration.",
    status: "Connected",
    color: "text-purple-600",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    logo: Users2,
    description: "Enterprise communication and collaboration workspace.",
    status: "Not Connected",
    color: "text-indigo-600",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    logo: FileText,
    description: "Automated aggregation of meeting summaries and action items.",
    status: "Connected",
    color: "text-emerald-600",
  },
  {
    id: "audio-transcript",
    name: "Audio Transcript",
    logo: Mic,
    description: "Speech-to-text conversion for all recorded meetings.",
    status: "Not Connected",
    color: "text-rose-600",
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Available Integrations</h1>
          <p className="text-muted-foreground">
            Manage your connected apps and synchronize data across your workflow.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search apps..."
            className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background transition-shadow focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((app) => {
            const AppIcon = app.logo;
            const isConnected = app.status === "Connected";

            return (
              <div
                key={app.id}
                className="group relative rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-gray-50 ${app.color}`}>
                      <AppIcon className="h-6 w-6" />
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isConnected 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Not Connected
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 flex-grow">
                    <h3 className="font-bold text-lg leading-none">{app.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  <button
                    className={`w-full flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      isConnected
                        ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                        : "bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {isConnected ? "Manage Integration" : "Connect App"}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground italic">No applications found matching your search.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
