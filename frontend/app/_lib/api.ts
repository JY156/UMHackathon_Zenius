const API_BASE_URL = 'http://localhost:5000/api';

export function parseDate(val: unknown): Date | null {
  if (!val) return null;
  // @ts-expect-error Firebase timestamp handling
  if (typeof val === 'object' && val._seconds) return new Date(val._seconds * 1000);
  const d = new Date(val as string | number | Date);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(val: unknown): string {
  const d = parseDate(val);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(val: unknown): string {
  const d = parseDate(val);
  if (!d) return 'N/A';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export interface InputMessage {
  id: string;
  source: string;
  subject: string;
  content: string;
  hasAttachments: boolean;
  status: string;
  timestamp: string;
  processed?: boolean;
}

export interface Approval {
  id: string;
  suggestedTid: string;
  fromUid: string;
  toUid: string;
  reasoning: string;
  status: string;
  createdAt: string;
  timestamp?: string;
  suggested_assignee?: string;
  task_id?: string;
}

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  workload_score: number;
  deadline?: string;
  lastStatusUpdate?: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  current_load: number;
  task_capacity: number;
  sentiment_score: number;
}

export interface HistoryData {
  timestamp: string;
  load_score: number;
}

export interface Log {
  id: string;
  event: string;
  timestamp: string;
  details: string;
}

export const api = {
  getInputs: async (): Promise<InputMessage[]> => {
    const res = await fetch(`${API_BASE_URL}/inputs`);
    if (!res.ok) throw new Error('Failed to fetch inputs');
    return res.json();
  },
  getApprovals: async (): Promise<Approval[]> => {
    const res = await fetch(`${API_BASE_URL}/approvals`);
    if (!res.ok) throw new Error('Failed to fetch all approvals');
    return res.json();
  },
  getPendingApprovals: async (): Promise<Approval[]> => {
    const res = await fetch(`${API_BASE_URL}/approvals?status=pending`);
    if (!res.ok) throw new Error('Failed to fetch approvals');
    return res.json();
  },
  updateApproval: async (id: string, status: 'approved' | 'rejected', actorUid: string) => {
    const res = await fetch(`${API_BASE_URL}/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actorUid }) // Now matches backend destructuring
    });
    if (!res.ok) throw new Error('Failed to update approval');
    return res.json();
  },
  getLogs: async (): Promise<Log[]> => {
    const res = await fetch(`${API_BASE_URL}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const data = await res.json();
    return data.map((u: any) => ({ ...u, id: u.uid || u.id }));
  },
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch(`${API_BASE_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch all tasks');
    const data = await res.json();
    return data.map((t: any) => ({ ...t, id: t.tid || t.id }));
  },
  getUserHistory: async (uid: string): Promise<HistoryData[]> => {
    const res = await fetch(`${API_BASE_URL}/users/${uid}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },
  getUserTasks: async (uid: string): Promise<Task[]> => {
    const res = await fetch(`${API_BASE_URL}/tasks/user/${uid}`);
    if (!res.ok) throw new Error('Failed to fetch user tasks');
    const data = await res.json();
    return data.map((t: any) => ({ ...t, id: t.tid || t.id }));
  },
  updateTaskStatus: async (tid: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${tid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
  }
};
