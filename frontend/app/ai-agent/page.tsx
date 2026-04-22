"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "../_components/app-shell";
import { useRoleStore } from "../_store/role-store";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ChevronRight, 
  RefreshCcw, 
  Check, 
  X, 
  Settings2,
  Clock,
  Briefcase,
  Users,
  FileText,
  BrainCircuit,
  Info
} from "lucide-react";

export default function AiAgentPage() {
  const { role } = useRoleStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ask" | "agents">("ask");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!mounted) return null;

  const handleSend = (text: string = input) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    
    const userMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Response with Reasoning
    setTimeout(() => {
      let response = {
        role: "assistant",
        recommendation: "",
        reasoning: "Model considered sprint commitments, delivery risk, and current skill overlap.",
        actions: true
      };

      if (messageText.toLowerCase().includes("workload") || messageText.toLowerCase().includes("reassign")) {
        response.recommendation = "I recommend reassigning 'Feature: Auth Refactor' from John to Sarah.";
        response.reasoning = "John is currently over-capacity (110%) while Sarah has 30% available bandwidth. Sarah also has previous experience with the Auth module.";
      } else if (messageText.toLowerCase().includes("availability")) {
        response.recommendation = "Currently, 3 out of 5 team members are at optimal capacity. 2 members (John, Emily) are nearing burnout limits.";
        response.reasoning = "Based on active JIRA ticket weight and scheduled calendar meetings for the next 48 hours.";
      } else {
        response.recommendation = "I've processed your request. How else can I assist with your team's orchestration today?";
        response.reasoning = "Analyzed organizational goals against current project milestones.";
        response.actions = false;
      }
      
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const quickPrompts = {
    ask: [
      { 
        title: "My Tasks", 
        sub: "What are my deadlines?", 
        icon: <Clock size={16} />, 
        text: "What are my high priority tasks for today?" 
      },
      { 
        title: "Team Status", 
        sub: role === "manager" ? "Who is online now?" : "Who is on my team?", 
        icon: <Users size={16} />, 
        text: role === "manager" ? "Who is currently available on the team?" : "Show me my team members and their availability." 
      },
      { 
        title: "Request Reassignment", 
        sub: "Need help with a task?", 
        icon: <RefreshCcw size={16} />, 
        text: "I am overwhelmed with my current tasks. Can you suggest a reassignment for 'Task: UI Refactor'?" 
      },
      { 
        title: "About Zenius", 
        sub: "How to use this tool?", 
        icon: <Info size={16} />, 
        text: "How can Zenius help me with my work today?" 
      },
    ],
    agents: role === "manager" ? [
      { title: "Assign Task", sub: "Create new Jira ticket", icon: <Briefcase size={16} />, text: "Assign a new development task to the next available dev" },
      { title: "Reassign Work", sub: "Balance the team load", icon: <RefreshCcw size={16} />, text: "Optimize team workload and reassign over-capacity tasks" },
      { title: "Burnout Check", sub: "Risk assessment", icon: <BrainCircuit size={16} />, text: "Analyze team burnout risk based on current sprint" },
      { title: "Generate Report", sub: "Weekly performance", icon: <Sparkles size={16} />, text: "Generate a weekly performance report for the engineering team" },
    ] : [
      { title: "Skill Analysis", sub: "My growth areas", icon: <Briefcase size={16} />, text: "What skills should I focus on based on my recent tasks?" },
      { title: "Workload Sync", sub: "Context summary", icon: <FileText size={16} />, text: "Summarize the context of my assigned tasks this week" },
      { title: "Burnout Risk", sub: "Personal check", icon: <BrainCircuit size={16} />, text: "Am I at risk of burnout based on my current ticket weight?" },
      { title: "Performance", sub: "Personal KPIs", icon: <Sparkles size={16} />, text: "Show my task completion performance for this sprint" },
    ]
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* AI Response Panel / Conversation History (Scrollable) */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 w-full scroll-smooth"
        >
          <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-10">
            {messages.length === 0 && (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-700">
                <h1 className="text-6xl font-extrabold tracking-tight text-[#0F172A]">Z.AI</h1>
                <p className="text-[#64748B] text-xl font-medium">Ask, assign, and automate tasks</p>
              </div>
            )}

            {messages.length > 0 && (
              <div className="text-center py-4 border-b border-slate-100 mb-8 animate-in slide-in-from-top-4 duration-500">
                <h1 className="text-2xl font-bold text-[#0F172A]">Z.AI</h1>
              </div>
            )}

            {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500`}
            >
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-[#2D4A3E] text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md text-sm font-medium max-w-[80%]">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4 max-w-[90%]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Bot size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zenius Recommendation</span>
                  </div>
                  
                  <div className="text-slate-800 text-base font-medium leading-relaxed">
                    {msg.recommendation}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                       <Sparkles size={12} className="text-emerald-500" /> Reasoning Engine
                    </div>
                    <p className="text-xs text-slate-600 italic leading-normal">
                      &quot;{msg.reasoning}&quot;
                    </p>
                  </div>

                  {msg.actions && role === "manager" && (
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98]">
                        <Check size={14} /> Approve
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98]">
                        <X size={14} /> Reject
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-lg transition-all active:scale-[0.98]">
                        <Settings2 size={16} />
                      </button>
                    </div>
                  )}
                  {msg.actions && role === "worker" && (
                    <div className="pt-2 px-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <Info size={12} />
                        MANAGER AUTHORIZATION REQUIRED FOR ACTION
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center animate-pulse">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Chatbox Container (Stuck to Bottom) */}
        <div className="border-t border-slate-100 bg-transparent backdrop-blur-md pt-6 pb-12 px-4 shrink-0">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Tabs */}
            <div className="flex justify-center">
              <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 border border-slate-200 shadow-inner">
                <button 
                  onClick={() => setActiveTab("ask")}
                  className={`px-8 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'ask' ? 'bg-white text-[#2D4A3E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Ask
                </button>
                <button 
                  onClick={() => setActiveTab("agents")}
                  className={`px-8 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'agents' ? 'bg-white text-[#2D4A3E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Agents
                </button>
              </div>
            </div>

            {/* Quick Prompt Buttons - Dynamic based on Tab and Hidden after first message */}
            {messages.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
                {quickPrompts[activeTab].map((prompt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(prompt.text)}
                    className="flex flex-col items-start text-left p-4 rounded-xl border border-slate-200/50 bg-white/60 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md transition-all group backdrop-blur-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-50/80 text-slate-400 group-hover:bg-white group-hover:text-emerald-500 flex items-center justify-center mb-3 transition-colors border border-transparent group-hover:border-emerald-100">
                      {prompt.icon}
                    </div>
                    <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">{prompt.title}</div>
                    <div className="text-[9px] text-slate-500 leading-tight">{prompt.sub}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Main Input */}
            <div className="relative group w-full max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full group-focus-within:bg-emerald-500/10 transition-all" />
              <div className="relative bg-white/50 border border-[#E2E8F0] rounded-xl shadow-lg shadow-slate-200/20 px-2 py-1 flex items-center gap-2 focus-within:border-emerald-500/30 transition-all backdrop-blur-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                  <BrainCircuit size={20} />
                </div>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeTab === 'ask' ? "Ask about tasks, availability, or Zenius..." : "Commander: Enter orchestration instruction..."}
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2 px-1 text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="bg-[#2D4A3E] hover:bg-[#1F332A] disabled:opacity-50 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-md shadow-emerald-900/10 shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
 


