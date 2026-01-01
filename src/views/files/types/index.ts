/**
 * File Types
 */

export interface File {
  id: number | string;
  filename?: string;
  name?: string;
  description?: string | null;
  size?: number;
  url?: string;
  file_url?: string;
  mime_type?: string;
  created_at?: string;
  updated_at?: string;
  note_id?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  msg: string;
  data: T;
}

export interface FilesResponse extends ApiResponse<File[]> {
  data: File[];
}

export interface FileResponse extends ApiResponse<File> {
  data: File;
}

export interface UpdateFileMetadataPayload {
  filename?: string;
  description?: string | null;
}

