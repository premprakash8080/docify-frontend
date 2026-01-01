/**
 * Task Types - Based on API Reference
 */

export interface Task {
  id: number;
  note_id: string | null;
  label: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  reminder?: string | null;
  assigned_to?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  flagged: boolean;
  completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  msg: string;
  data: T;
}

export interface TasksResponse extends ApiResponse<{ tasks: Task[]; count: number }> {
  data: {
    tasks: Task[];
    count: number;
  };
}

export interface TaskResponse extends ApiResponse<{ task: Task }> {
  data: {
    task: Task;
  };
}

export interface CreateTaskPayload {
  note_id?: string | null;
  label: string;
  description?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  reminder?: string | null;
  assigned_to?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  flagged?: boolean;
  sort_order?: number;
  completed?: boolean;
}

export interface UpdateTaskPayload {
  id: number;
  label?: string;
  description?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  reminder?: string | null;
  assigned_to?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  flagged?: boolean;
  sort_order?: number;
  completed?: boolean;
}

export interface ToggleTaskCompletePayload {
  id: number;
  completed: boolean;
}

export interface DeleteTaskPayload {
  id: number;
}

