// Types based on API reference

export interface Note {
  id: string; // UUID
  title: string;
  notebook_id: number | null;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  firebase_document_id?: string | null;
  created_at: string;
  updated_at: string;
  version?: number;
}

export interface Notebook {
  id: number;
  name: string;
  description?: string | null;
  stack_id: number | null;
  color_id?: number | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Stack {
  id: number;
  name: string;
  description?: string | null;
  color_id?: number | null;
  sort_order: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  color?: {
    id: number;
    name: string;
    hex_code: string;
  };
  notebooks?: Notebook[];
}

export interface ApiResponse<T> {
  success: boolean;
  msg?: string;
  data: T;
}

export interface NotesResponse extends ApiResponse<Note[]> {
  data: Note[];
}

export interface NotebooksResponse extends ApiResponse<Notebook[]> {
  data: Notebook[];
}

export interface CreateNotePayload {
  title?: string;
  notebook_id?: number | null;
  firebase_document_id?: string;
}

export interface UpdateNotePayload {
  title?: string;
  notebook_id?: number | null;
  version?: number;
}

export interface FetchNotesParams {
  tag_id?: number;
  stack_id?: number;
  notebook_id?: string; // UUID
  archived?: boolean;
  trashed?: boolean;
}

export interface FetchNotebooksParams {
  stack_id?: number | null;
  archived?: boolean;
  trashed?: boolean;
}

