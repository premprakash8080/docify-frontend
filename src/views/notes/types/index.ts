export interface NoteContent {
  user_id: number;
  content: string;
  is_trashed: boolean;
  notebook_id: string | null;
  title: string;
  updated_at: {
    _seconds: number;
    _nanoseconds: number;
  };
  created_at: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface Note {
  id: string; // UUID
  user_id?: number;
  title: string;
  notebook_id: string | number | null;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  firebase_document_id?: string | null;
  created_at: string;
  updated_at: string;
  last_modified?: string;
  version?: number;
  synced?: boolean;
  content?: string | NoteContent;
  notebook_name?: string;
  notebook_description?: string | null;
  notebook_color_id?: number | null;
  notebook_color_hex?: string | null;
  notebook_color_name?: string | null;
  stack_id?: number | null;
  stack_name?: string | null;
  stack_description?: string | null;
  stack_color_id?: number | null;
  stack_color_hex?: string | null;
  stack_color_name?: string | null;
  user_email?: string;
  user_display_name?: string;
  tag_count?: number;
  tags?: Tag[];
  file_count?: number;
  task_count?: number;
  completed_task_count?: number;
  files?: File[];
  tasks?: Task[];
}

export interface Tag {
  id: number;
  name: string;
  color_id: number | null;
  color?: {
    id: number;
    name: string;
    hex_code: string;
  };
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  filename: string;
  name?: string;
  description?: string;
  size?: number;
  url?: string;
  file_url?: string;
  note_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  start_date?: string;
  flagged?: boolean;
  note_id?: string;
  created_at: string;
  updated_at: string;
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

export interface NoteResponse extends ApiResponse<Note> {
  data: Note;
}

export interface NoteNamesResponse extends ApiResponse<string[]> {
  data: string[];
}

export interface NoteContentResponse extends ApiResponse<string> {
  data: string;
}

export interface TagsResponse extends ApiResponse<Tag[]> {
  data: Tag[];
}

export interface TagResponse extends ApiResponse<Tag> {
  data: Tag;
}

export interface FilesResponse extends ApiResponse<File[]> {
  data: File[];
}

export interface TasksResponse extends ApiResponse<Task[]> {
  data: Task[];
}

export interface NotebooksWithStacksResponse extends ApiResponse<Array<{ stack: Stack; notebooks: Notebook[] }>> {
  data: Array<{ stack: Stack; notebooks: Notebook[] }>;
}

export interface NoteWithStackResponse extends ApiResponse<{ note: Note; stack: Stack | null }> {
  data: { note: Note; stack: Stack | null };
}

// Payload types
export interface CreateNotePayload {
  title?: string;
  notebook_id?: number | null;
  firebase_document_id?: string;
  content?: string;
}

export interface UpdateNotePayload {
  title?: string;
  notebook_id?: number | null;
  version?: number;
  content?: string;
}

export interface SaveNoteContentPayload {
  content: string;
  title?: string;
  version?: number;
}

export interface MoveNoteToNotebookPayload {
  notebook_id: number;
}

export interface PinNotePayload {
  pinned: boolean;
}

export interface ArchiveNotePayload {
  archived: boolean;
}

export interface TrashNotePayload {
  trashed: boolean;
}

export interface AddTagToNotePayload {
  tag_id: number;
}

export interface RemoveTagFromNotePayload {
  tag_id: number;
}

export interface CreateTagPayload {
  name: string;
  color_id?: number | null;
}

export interface UploadImagePayload {
  file: globalThis.File;
  note_id?: string;
}

export interface FetchNotesParams {
  tag_id?: number;
  stack_id?: number;
  notebook_id?: string;
  archived?: boolean;
  trashed?: boolean;
  pinned?: boolean;
}

export interface GetNoteByIdParams {
  id: string;
}

export interface GetNoteContentParams {
  note_id: string;
  firebase_document_id?: string;
}

