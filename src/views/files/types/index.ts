/**
 * File Types
 */

export interface File {
  id: string;
  user_id: number;
  note_id: string | null;
  firebase_storage_path: string;
  filename: string;
  mime_type: string;
  size: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  name?: string;
  url?: string;
  file_url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  msg?: string;
  data: T;
}

export interface FilesResponse {
  success: boolean;
  msg?: string;
  data: {
    files: File[];
    count: number;
  };
}

export interface FileResponse extends ApiResponse<File> {
  data: File;
}

export interface UpdateFileMetadataPayload {
  filename?: string;
  description?: string | null;
}

