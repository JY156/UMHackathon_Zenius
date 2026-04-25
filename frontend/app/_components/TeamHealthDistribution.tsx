"use client";

import { useEffect, useState } from "react";
import { api, User, Task, HistoryData } from "../_lib/api";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function TeamHealthDistribution() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserData(selectedUserId);
    } else if (users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch {
      toast.error("Failed to fetch team health");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (uid: string) => {
    setIsUserLoading(true);
    try {
      const [tasksData, historyData] = await Promise.all([
        api.getUserTasks(uid),
        api.getUserHistory(uid)
      ]);
      setTasks(tasksData);
      
      const user = users.find(u => u.id === uid);
      const capacity = user?.task_capacity || 30;

      // Helper to safely parse Firestore timestamps into valid JS Dates
      const parseFirestoreDate = (dateVal: any) => {
        if (!dateVal) return new Date(); // Fallback to now
        let time = new Date(dateVal).getTime();
        
        if (isNaN(time)) {
            if (dateVal._seconds) return new Date(dateVal._seconds * 1000);
            if (dateVal.seconds) return new Date(dateVal.seconds * 1000);
        }
        return isNaN(time) ? new Date() : new Date(time);
      };

      // Format history data for chart
      const formattedHistory = historyData.map(h => {
        const validDate = parseFirestoreDate(h.timestamp);
        
        return {
          ...h,
          loadPercentage: Math.min(Math.round((h.load_score / capacity) * 100), 100),
          timeLabel: validDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
                     validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      
      setHistory(formattedHistory);
    } catch {
      toast.error("Failed to fetch user details");
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleMarkDone = async (tid: string) => {
    try {
      await api.updateTaskStatus(tid, "completed");
      toast.success("Task marked as done");
      if (selectedUserId) fetchUserData(selectedUserId);
    } catch {
      toast.error("Failed to update task");
    }
  };

  // Define constants for your business logic
  const CRITICAL_THRESHOLD = 0.9; // 90%
  const WARNING_THRESHOLD = 0.7;  // 70%

  const getStatusTheme = (load: number, capacity: number) => {
    const ratio = load / capacity;
    if (ratio >= CRITICAL_THRESHOLD) return { color: "bg-red-500", text: "Overwhelmed", chip: "bg-red-100 text-red-700 border-red-200" };
    if (ratio >= WARNING_THRESHOLD) return { color: "bg-amber-500", text: "At Risk", chip: "bg-amber-100 text-amber-700 border-amber-200" };
    return { color: "bg-emerald-500", text: "Balanced", chip: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  };
  // Standardized thresholds
  const DANGER_RATIO = 0.9;  // 90%
  const WARNING_RATIO = 0.7; // 70%

  const getProgressColor = (load: number, capacity: number) => {
    const ratio = load / capacity;
    if (ratio >= DANGER_RATIO) return "bg-red-500";
    if (ratio >= WARNING_RATIO) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Group tasks for the active board
  const notStartedTasks = tasks.filter(t => t.status.toLowerCase() === 'pending' || t.status.toLowerCase() === 'not started' || t.status.toLowerCase() === 'todo');
  const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in progress' || t.status.toLowerCase() === 'in-progress');
  const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'completed' || t.status.toLowerCase() === 'done');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Row: Team Health Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4 tracking-tight">Team Workload & Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {users.map(user => {
            const loadRatio = Math.min((user.current_load / user.task_capacity) * 100, 100);
            const isSelected = selectedUserId === user.id;
            
            // Use the standardized theme logic for consistent colors
            const theme = getStatusTheme(user.current_load, user.task_capacity);
            
            return (
              <div 
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`cursor-pointer bg-card rounded-2xl p-4 border transition-all duration-300 ${isSelected ? 'border-primary ring-4 ring-primary/20 scale-105 bg-white shadow-lg z-10' : 'border-border hover:border-primary/40 shadow-sm opacity-80 hover:opacity-100 scale-100'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-sm text-foreground flex items-center gap-2 mb-2">
                      {user.name}
                    </p>
                    {/* Chip now uses the unified theme color */}
                    <span className={`${theme.chip} border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                      {theme.text}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {user.name.charAt(0)}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-muted-foreground">Workload</span>
                    {/* Changed from raw numbers to percentage */}
                    <span className={`font-bold ${theme.textColor}`}>
                      {Math.round(loadRatio)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${theme.color}`}
                      style={{ width: `${loadRatio}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isUserLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {/* Middle Row: Active Task Board */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5 relative">
          {isUserLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Active Tasks for {users.find(u => u.id === selectedUserId)?.name || 'Selected User'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
            {/* Column: To Do */}
            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex justify-between">
                To Do <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{notStartedTasks.length}</span>
              </h3>
              <div className="space-y-3">
                {notStartedTasks.map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-lg border border-border shadow-sm">
                    <p className="text-sm font-bold">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: In Progress */}
            <div className="bg-blue-50/30 rounded-xl p-3 border border-blue-100/50">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 px-1 flex justify-between">
                In Progress <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px]">{inProgressTasks.length}</span>
              </h3>
              <div className="space-y-3">
                {inProgressTasks.map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <p className="text-sm font-bold">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Completed */}
            <div className="bg-emerald-50/30 rounded-xl p-3 border border-emerald-100/50 opacity-80 hover:opacity-100 transition-opacity">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 px-1 flex justify-between">
                Completed <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">{completedTasks.length}</span>
              </h3>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                    <p className="text-sm font-bold text-slate-500 line-through decoration-slate-300">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom/Side Row: Resilience Chart */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col relative">
          {isUserLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Resilience & Load History
          </h2>
          <p className="text-xs text-muted-foreground mb-6">Historical workload percentage</p>
          
          <div className="flex-1 min-h-[250px] -ml-4">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {/* Stroke Gradient: Changes the line color at specific heights */}
                    <linearGradient id="colorStroke" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />   {/* 100% Load */}
                      <stop offset="10%" stopColor="#ef4444" />  {/* 90% Load - Hard Stop Red */}
                      <stop offset="10%" stopColor="#eab308" />  {/* Switch to Yellow */}
                      <stop offset="30%" stopColor="#eab308" />  {/* 70% Load - Hard Stop Yellow */}
                      <stop offset="30%" stopColor="#10b981" />  {/* Switch to Green */}
                      <stop offset="100%" stopColor="#10b981" /> {/* 0% Load */}
                    </linearGradient>

                    {/* Fill Gradient: Semi-transparent area colors */}
                    <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="30%" stopColor="#eab308" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="timeLabel" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  
                  {/* The "Danger Line" visual at 90% */}
                  <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Danger', fill: '#ef4444', fontSize: 10 }} />

                  <Area 
                    type="monotone" 
                    dataKey="loadPercentage" 
                    stroke="url(#colorStroke)" 
                    strokeWidth={3}
                    fill="url(#colorFill)"
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#cbd5e1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No history data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
