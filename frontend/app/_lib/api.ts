export interface InputMessage {
  id: string;
  source: string;
  subject: string;
  content: string;
  hasAttachments: boolean;
  status: string;
  timestamp: string;
}

export interface Approval {
  id: string;
  task_id: string;
  suggested_assignee: string;
  reasoning: string;
  status: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assigned_to: string;
  workload_score: number;
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
    const res = await fetch('/api/inputs');
    if (!res.ok) throw new Error('Failed to fetch inputs');
    return res.json();
  },
  getPendingApprovals: async (): Promise<Approval[]> => {
    const res = await fetch('/api/approvals?status=pending');
    if (!res.ok) throw new Error('Failed to fetch approvals');
    return res.json();
  },
  updateApproval: async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update approval');
    return res.json();
  },
  getLogs: async (): Promise<Log[]> => {
    const res = await fetch('/api/logs');
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  getUserHistory: async (uid: string): Promise<HistoryData[]> => {
    const res = await fetch(`/api/users/${uid}/history`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },
  getUserTasks: async (uid: string): Promise<Task[]> => {
    const res = await fetch(`/api/tasks/user/${uid}`);
    if (!res.ok) throw new Error('Failed to fetch user tasks');
    return res.json();
  },
  updateTaskStatus: async (tid: string, status: string) => {
    const res = await fetch(`/api/tasks/${tid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
  }
};
