import httpService from '@/core/http';
import type { ApiResponse } from '@/core/http/httpTypes';
import { ENDPOINTS } from './note.endpoints';
import type {
  Note,
  Notebook,
  NotesResponse,
  NotebooksResponse,
  CreateNotePayload,
  UpdateNotePayload,
  FetchNotesParams,
  FetchNotebooksParams,
} from '../types';

/**
 * Note Service - Using centralized HttpService
 * 
 * Features:
 * - Automatic auth token attachment
 * - Global loader management
 * - Environment-based API URLs
 * - Type-safe requests and responses
 */
class NoteService {
  /**
   * Get all notes with optional filters
   * @param params - Query parameters for filtering notes
   * @param showLoader - Whether to show global loader (default: true)
   */
  async getAllNotes(
    params: FetchNotesParams = {},
    showLoader = true
  ): Promise<NotesResponse | Note[]> {
    const queryParams = new URLSearchParams();
    if (params.notebook_id) queryParams.append('notebook_id', params.notebook_id);
    if (params.tag_id) queryParams.append('tag_id', params.tag_id.toString());
    if (params.stack_id) queryParams.append('stack_id', params.stack_id.toString());
    if (params.archived !== undefined) queryParams.append('archived', params.archived.toString());
    if (params.trashed !== undefined) queryParams.append('trashed', params.trashed.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.getAllNotes}?${queryString}` : ENDPOINTS.getAllNotes;

    const response = await httpService.get<Note[]>(url, { showLoader });
    
    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    const apiResponse = response.data as NotesResponse;
    return apiResponse.data || [];
  }

  /**
   * Create a new note
   * @param data - Note creation payload
   * @param showLoader - Whether to show global loader (default: true)
   */
  async createNote(
    data: CreateNotePayload = {},
    showLoader = true
  ): Promise<{ success: boolean; msg: string; data: { note: Note } }> {
    const response = await httpService.post<{ note: Note }>(
      ENDPOINTS.createNote,
      {
        title: data.title || 'Untitled Note',
        notebook_id: data.notebook_id || null,
        firebase_document_id: data.firebase_document_id || null,
      },
      { showLoader }
    );
    
    // Handle both response formats
    if ('data' in response.data && 'note' in (response.data as { data: { note: Note } }).data) {
      return response.data as { success: boolean; msg: string; data: { note: Note } };
    }
    return {
      success: true,
      msg: 'Note created successfully',
      data: { note: response.data as unknown as Note },
    };
  }

  /**
   * Get all notebooks
   * @param params - Query parameters for filtering notebooks
   * @param showLoader - Whether to show global loader (default: true)
   */
  async getAllNotebooks(
    params: FetchNotebooksParams = {},
    showLoader = true
  ): Promise<NotebooksResponse | Notebook[]> {
    const response = await httpService.post<Notebook[]>(
      ENDPOINTS.getAllNotebooks,
      {
        stack_id: params.stack_id || null,
        archived: params.archived ?? false,
        trashed: params.trashed ?? false,
      },
      { showLoader }
    );
    
    // Handle both response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    const apiResponse = response.data as NotebooksResponse;
    return apiResponse.data || [];
  }

  /**
   * Update a note
   * @param noteId - Note ID to update
   * @param data - Update payload
   * @param showLoader - Whether to show global loader (default: true)
   */
  async updateNote(
    noteId: string,
    data: UpdateNotePayload,
    showLoader = true
  ): Promise<{ success: boolean; msg: string; data: { note: Note } }> {
    const response = await httpService.put<{ note: Note }>(
      ENDPOINTS.updateNote(noteId),
      data,
      { showLoader }
    );
    
    // Handle both response formats
    if ('data' in response.data && 'note' in (response.data as { data: { note: Note } }).data) {
      return response.data as { success: boolean; msg: string; data: { note: Note } };
    }
    return {
      success: true,
      msg: 'Note updated successfully',
      data: { note: response.data as unknown as Note },
    };
  }

  /**
   * Delete a note
   * @param noteId - Note ID to delete
   * @param showLoader - Whether to show global loader (default: true)
   */
  async deleteNote(noteId: string, showLoader = true): Promise<{ success: boolean; msg: string }> {
    const response = await httpService.delete<{ success: boolean; msg: string }>(ENDPOINTS.deleteNote(noteId), { showLoader });
    
    // Handle both response formats
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'msg' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'Note deleted successfully',
    };
  }

  /**
   * Get scratch pad content
   * @param showLoader - Whether to show global loader (default: false)
   * @returns Scratch pad response with content and updated_at
   */
  async getScratchpad(showLoader = false): Promise<ApiResponse<{ content: string; updated_at: string }>> {
    const response = await httpService.get<{ content: string; updated_at: string }>(
      ENDPOINTS.getScratchpad,
      { showLoader }
    );
    
    // API always returns { success: true, data: { content, updated_at } }
    return response.data as ApiResponse<{ content: string; updated_at: string }>;
  }

  /**
   * Update scratch pad content
   * @param content - Scratch pad content to save
   * @param showLoader - Whether to show global loader (default: false)
   * @returns Updated scratch pad response with content and updated_at
   */
  async updateScratchpad(
    content: string,
    showLoader = false
  ): Promise<ApiResponse<{ content: string; updated_at: string }>> {
    const response = await httpService.put<{ content: string; updated_at: string }>(
      ENDPOINTS.updateScratchpad,
      { content },
      { showLoader }
    );
    
    // API always returns { success: true, data: { content, updated_at } }
    return response.data as ApiResponse<{ content: string; updated_at: string }>;
  }

  /**
   * Clear scratch pad content
   * @param showLoader - Whether to show global loader (default: false)
   * @returns Success response
   */
  async clearScratchpad(showLoader = false): Promise<{ success: boolean; msg: string }> {
    const response = await httpService.delete<{ success: boolean; msg: string }>(
      ENDPOINTS.clearScratchpad,
      { showLoader }
    );
    
    // API always returns { success: true, msg: string }
    return response.data as { success: boolean; msg: string };
  }
}

export default new NoteService();

