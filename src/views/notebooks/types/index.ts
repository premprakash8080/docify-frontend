/**
 * Notebook-related TypeScript interfaces and types
 */

import type { Note } from '@/views/Dashboard/types';

// Override base types to match API response (UUIDs instead of numbers)
export interface Notebook {
  id: string; // UUID
  user_id?: number;
  stack_id: string | null; // UUID or null
  name: string;
  description?: string | null;
  color_id?: number | null;
  color_hex?: string | null;
  color_name?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  stack_name?: string | null;
  stack_description?: string | null;
  note_count?: number;
  pinned_notes?: number;
  archived_notes?: number;
  notes?: Note[];
}

export interface Stack {
  id: string; // UUID
  name: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  color?: {
    id: number;
    name: string;
    hex_code: string;
  } | null;
  notebooks?: Notebook[];
  notebook_count?: number;
}

// Extended types for notebooks view
export interface StackWithNotebooks extends Stack {
  notebooks?: NotebookWithNotes[];
  created_by?: string;
}

export interface NotebookWithNotes extends Notebook {
  notes?: Note[];
  created_by?: string;
}

export interface NotebooksState {
  stacks: StackWithNotebooks[];
  standaloneNotebooks: NotebookWithNotes[];
  loading: boolean;
  error: string | null;
  expandedStacks: Record<string, boolean>; // UUID strings
  expandedNotebooks: Record<string, boolean>; // UUID strings
  searchText: string;
  renameStackDialog: { open: boolean; stack: StackWithNotebooks | null };
  deleteStackDialog: { open: boolean; stack: StackWithNotebooks | null };
  addNotebookDialog: { open: boolean; stack: StackWithNotebooks | null };
  renameNotebookDialog: { open: boolean; notebook: NotebookWithNotes | null };
  deleteNotebookDialog: { open: boolean; notebook: NotebookWithNotes | null };
  moveNotebookDialog: { open: boolean; notebook: NotebookWithNotes | null };
  renameNoteDialog: { open: boolean; note: Note | null };
  deleteNoteDialog: { open: boolean; note: Note | null };
  moveNoteDialog: { open: boolean; note: Note | null };
}

export interface CreateStackPayload {
  name: string;
  description?: string | null;
  color_id?: number | null;
}

export interface UpdateStackPayload {
  id: string; // UUID
  name?: string;
  description?: string | null;
  color_id?: number | null;
}

export interface CreateNotebookPayload {
  name: string;
  description?: string | null;
  stack_id?: string | null; // UUID or null
  color_id?: number | null;
}

export interface UpdateNotebookPayload {
  id: string; // UUID
  name?: string;
  description?: string | null;
  stack_id?: string | null; // UUID or null
  color_id?: number | null;
}

export interface MoveNotebookPayload {
  notebook_id: string; // UUID
  stack_id: string | null; // UUID or null
}

export interface FetchNotebooksParams {
  stack_id?: number | null;
  archived?: boolean;
  trashed?: boolean;
}

