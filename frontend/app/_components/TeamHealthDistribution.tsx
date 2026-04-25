"use client";

import { useEffect, useState } from "react";
import { api, User, Task, HistoryData } from "../_lib/api";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

export function TeamHealthDistribution() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const [tasksData, historyData] = await Promise.all([
        api.getUserTasks(uid),
        api.getUserHistory(uid)
      ]);
      setTasks(tasksData);
      
      // Format history data for chart
      const formattedHistory = historyData.map(h => ({
        ...h,
        timeLabel: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setHistory(formattedHistory);
    } catch {
      toast.error("Failed to fetch user details");
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

  const getBorderColor = (score: number) => {
    if (score < 0.4) return "border-red-500 shadow-red-500/20";
    if (score > 0.7) return "border-emerald-500 shadow-emerald-500/20";
    return "border-border";
  };

  const getProgressColor = (load: number, capacity: number) => {
    const ratio = load / capacity;
    if (ratio > 0.9) return "bg-red-500";
    if (ratio > 0.7) return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Team Distribution...</div>;
  }

  // Group tasks for the active board
  const notStartedTasks = tasks.filter(t => t.status.toLowerCase() === 'pending' || t.status.toLowerCase() === 'not started');
  const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in progress');
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
            
            return (
              <div 
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`cursor-pointer bg-card rounded-2xl p-4 border-2 transition-all ${getBorderColor(user.sentiment_score)} ${isSelected ? 'ring-2 ring-primary/20 scale-[1.02] bg-slate-50' : 'hover:border-primary/40 shadow-sm'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                    {user.name.charAt(0)}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-muted-foreground">Workload</span>
                    <span className="text-foreground">{user.current_load} / {user.task_capacity}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${getProgressColor(user.current_load, user.task_capacity)}`}
                      style={{ width: `${loadRatio}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Middle Row: Active Task Board */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-5">
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
                    <div className="mt-3 flex justify-end">
                      <button 
                        onClick={() => handleMarkDone(task.id)}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 font-bold px-2 py-1 rounded transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
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
                    <div className="mt-3 flex justify-end">
                      <button 
                        onClick={() => handleMarkDone(task.id)}
                        className="text-[10px] bg-blue-50 hover:bg-emerald-50 hover:text-emerald-600 text-blue-600 font-bold px-2 py-1 rounded transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
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
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col">
          <h2 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Resilience & Load History
          </h2>
          <p className="text-xs text-muted-foreground mb-6">Historical workload progression</p>
          
          <div className="flex-1 min-h-[250px] -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeLabel" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="load_score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLoad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
