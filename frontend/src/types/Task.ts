export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string; // ISO date string "YYYY-MM-DD"
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700 border border-slate-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200',
  DONE: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};
