import httpService from '@/core/http';
import { NOTES_ENDPOINTS } from './note.endpoints';
import type {
  Note,
  Tag,
  File,
  Task,
  Notebook,
  Stack,
  NotesResponse,
  NoteResponse,
  NoteNamesResponse,
  NoteContentResponse,
  TagsResponse,
  TagResponse,
  FilesResponse,
  TasksResponse,
  NotebooksWithStacksResponse,
  NoteWithStackResponse,
  CreateNotePayload,
  UpdateNotePayload,
  SaveNoteContentPayload,
  MoveNoteToNotebookPayload,
  AddTagToNotePayload,
  RemoveTagFromNotePayload,
  CreateTagPayload,
  UploadImagePayload,
  FetchNotesParams,
} from '../types';

class NoteService {
  // CRUD Operations
  async getAllNotes(
    params: FetchNotesParams = {},
    showLoader = true
  ): Promise<NotesResponse | Note[] | { data: { notes: Note[] } }> {
    const queryParams = new URLSearchParams();
    if (params.tag_id) queryParams.append('tag_id', params.tag_id.toString());
    if (params.stack_id) queryParams.append('stack_id', params.stack_id.toString());
    if (params.notebook_id) queryParams.append('notebook_id', params.notebook_id);
    if (params.archived !== undefined) queryParams.append('archived', params.archived.toString());
    if (params.trashed !== undefined) queryParams.append('trashed', params.trashed.toString());
    if (params.pinned !== undefined) queryParams.append('pinned', params.pinned.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${NOTES_ENDPOINTS.getAllNotes}?${queryString}` : NOTES_ENDPOINTS.getAllNotes;

    const response = await httpService.get<Note[] | { data: { notes: Note[] } }>(url, { showLoader });
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Handle { success: true, data: { notes: [...] } }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const data = (response.data as { data: { notes: Note[] } }).data;
      if (data && 'notes' in data && Array.isArray(data.notes)) {
        return { data: { notes: data.notes } };
      }
    }
    
    // Handle { success: true, data: [...] }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const data = (response.data as NotesResponse).data;
      if (Array.isArray(data)) {
        return data;
      }
    }
    
    return [];
  }

  async getNotesName(showLoader = true): Promise<NoteNamesResponse | string[]> {
    const response = await httpService.get<string[]>(NOTES_ENDPOINTS.getNotesName, { showLoader });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as NoteNamesResponse).data || [];
  }

  async getNoteById(
    id: string,
    showLoader = true
  ): Promise<NoteResponse | Note> {
    const response = await httpService.get<Note>(
      `${NOTES_ENDPOINTS.getNoteById}?id=${id}`,
      { showLoader }
    );
    return response.data;
  }

  async createNote(
    data: CreateNotePayload = {},
    showLoader = true
  ): Promise<NoteResponse | Note | { success: boolean; msg: string; data: { note: Note } }> {
    const response = await httpService.post<
      Note | 
      { success: boolean; msg: string; data: { note: Note } }
    >(
      NOTES_ENDPOINTS.createNote,
      {
        title: data.title || 'Untitled',
        notebook_id: data.notebook_id || null,
        firebase_document_id: data.firebase_document_id || null,
        content: data.content || '',
      },
      { showLoader }
    );
    
    // Handle new response format: { success: true, msg: "...", data: { note: {...} } }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return response.data as { success: boolean; msg: string; data: { note: Note } };
    }
    
    // Handle legacy NoteResponse format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const responseData = response.data as any;
      if (responseData.data && typeof responseData.data === 'object' && 'id' in responseData.data) {
        return responseData.data as Note;
      }
      if (typeof responseData.data === 'object') {
        return responseData as NoteResponse;
      }
    }
    
    return response.data as Note;
  }

  async updateNote(
    id: string,
    data: UpdateNotePayload,
    showLoader = true
  ): Promise<NoteResponse | Note> {
    const response = await httpService.put<Note>(
      NOTES_ENDPOINTS.updateNote(id),
      data,
      { showLoader }
    );
    if ('data' in response.data && typeof (response.data as NoteResponse).data === 'object') {
      return (response.data as NoteResponse).data;
    }
    return response.data as Note;
  }

  async deleteNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.delete(NOTES_ENDPOINTS.deleteNote(id), { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note deleted successfully' };
  }

  // Notebook Operations
  async moveNoteToNotebook(
    id: string,
    payload: MoveNoteToNotebookPayload | { notebook_id: string | number },
    showLoader = true
  ): Promise<{ success: boolean; msg?: string }> {
    const notebookId = String(payload.notebook_id);
    const response = await httpService.put(
      NOTES_ENDPOINTS.moveNoteToNotebook(id, notebookId),
      {},
      { showLoader }
    );
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg?: string };
    }
    
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note moved successfully' };
  }

  async createNotebook(
    data: { name: string; description?: string; stack_id?: number | null },
    showLoader = true
  ): Promise<{ success: boolean; msg?: string; data?: { notebook: Notebook } }> {
    const response = await httpService.post<{ notebook: Notebook } | Notebook>(
      NOTES_ENDPOINTS.createNotebook,
      data,
      { showLoader }
    );
    let notebook: Notebook;
    if ('notebook' in (response.data as { notebook: Notebook })) {
      notebook = (response.data as { notebook: Notebook }).notebook;
    } else {
      notebook = response.data as Notebook;
    }
    return {
      success: true,
      msg: 'Notebook created successfully',
      data: { notebook },
    };
  }

  // State Operations
  async pinNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.pinNote(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note pinned successfully' };
  }

  async unpinNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.unpinNote(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note unpinned successfully' };
  }

  async archiveNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.archiveNote(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note archived successfully' };
  }

  async unarchiveNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.unarchiveNote(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note unarchived successfully' };
  }

  async trashNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.trashNote(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note trashed successfully' };
  }

  async restoreNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.restoreNote(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note restored successfully' };
  }

  // Sync
  async markNoteSynced(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.put(NOTES_ENDPOINTS.markNoteSynced(id), {}, { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note marked as synced' };
  }

  // Files & Tasks
  async getNoteFiles(id: string, showLoader = true): Promise<FilesResponse | File[]> {
    const response = await httpService.get<File[]>(NOTES_ENDPOINTS.getNoteFiles(id), { showLoader });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as FilesResponse).data || [];
  }

  async getNoteTasks(id: string, showLoader = true): Promise<TasksResponse | Task[]> {
    const response = await httpService.get<Task[]>(NOTES_ENDPOINTS.getNoteTasks(id), { showLoader });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as TasksResponse).data || [];
  }

  // Content Operations
  async saveNoteContent(
    id: string,
    payload: SaveNoteContentPayload,
    showLoader = true
  ): Promise<{ success: boolean; msg?: string }> {
    const requestPayload: { content: string; title?: string } = {
      content: payload.content,
    };
    if (payload.title) {
      requestPayload.title = payload.title;
    }
    const response = await httpService.put(
      NOTES_ENDPOINTS.saveNoteContent(id),
      requestPayload,
      { showLoader }
    );
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note content saved successfully' };
  }

  async getNoteContent(
    id: string,
    showLoader = true
  ): Promise<NoteContentResponse | string | { success: boolean; data: { note: Note; tags: any[]; stack_name: string | null } }> {
    const queryParams = new URLSearchParams();
    queryParams.append('id', id);
    const url = `${NOTES_ENDPOINTS.getNoteContent}?${queryParams.toString()}`;
    const response = await httpService.get<
      string | 
      { content: string; note_id: string } | 
      { success: boolean; data: { note: Note; tags: any[]; stack_name: string | null } }
    >(url, { showLoader });
    
    // Handle new response format: { success: true, data: { note: {...}, tags: [], stack_name: null } }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return response.data as { success: boolean; data: { note: Note; tags: any[]; stack_name: string | null } };
    }
    
    // Handle legacy string format
    if (typeof response.data === 'string') {
      return response.data;
    }
    
    // Handle { content: string } format
    if (response.data && typeof response.data === 'object' && 'content' in response.data) {
      return (response.data as { content: string }).content;
    }
    
    // Handle nested data structure
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const data = (response.data as NoteContentResponse).data;
      if (typeof data === 'string') {
        return data;
      }
    }
    
    return '';
  }

  // Image Operations
  async uploadNoteImage(
    payload: UploadImagePayload,
    showLoader = true
  ): Promise<{ success: boolean; msg?: string; data?: File }> {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.note_id) {
      formData.append('note_id', payload.note_id);
    }
    const response = await httpService.post<File>(
      NOTES_ENDPOINTS.uploadNoteImage,
      formData,
      {
        showLoader,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return {
      success: true,
      msg: 'Image uploaded successfully',
      data: 'data' in response.data ? (response.data as { data: File }).data : (response.data as File),
    };
  }

  async getNoteImages(showLoader = true): Promise<FilesResponse | File[]> {
    const response = await httpService.get<File[]>(NOTES_ENDPOINTS.getNoteImages, { showLoader });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as FilesResponse).data || [];
  }

  async deleteNoteImage(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.delete(NOTES_ENDPOINTS.deleteNoteImage(id), { showLoader });
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Image deleted successfully' };
  }

  // Tags
  async getUserTags(showLoader = true): Promise<TagsResponse | Tag[]> {
    const response = await httpService.get<Tag[]>(NOTES_ENDPOINTS.getUserTags, { showLoader });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as TagsResponse).data || [];
  }

  async addTagToNote(
    payload: AddTagToNotePayload & { note_id: string },
    showLoader = true
  ): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.post(
      NOTES_ENDPOINTS.addTagToNote,
      payload,
      { showLoader }
    );
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Tag added successfully' };
  }

  async removeTagFromNote(
    payload: RemoveTagFromNotePayload & { note_id: string },
    showLoader = true
  ): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.post(
      NOTES_ENDPOINTS.removeTagFromNote,
      payload,
      { showLoader }
    );
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Tag removed successfully' };
  }

  async createTag(
    payload: CreateTagPayload,
    showLoader = true
  ): Promise<TagResponse | Tag> {
    const response = await httpService.post<Tag>(
      NOTES_ENDPOINTS.createTag,
      payload,
      { showLoader }
    );
    if ('data' in response.data && typeof (response.data as TagResponse).data === 'object') {
      return (response.data as TagResponse).data;
    }
    return response.data as Tag;
  }

  async getTagById(id: number, showLoader = true): Promise<TagResponse | Tag> {
    const response = await httpService.get<Tag>(NOTES_ENDPOINTS.getTagById(id), { showLoader });
    if ('data' in response.data && typeof (response.data as TagResponse).data === 'object') {
      return (response.data as TagResponse).data;
    }
    return response.data as Tag;
  }

  // Move / Stack
  async getNoteWithStack(
    noteId: string,
    showLoader = true
  ): Promise<NoteWithStackResponse | { note: Note; stack: Stack | null }> {
    const response = await httpService.get<{ note: Note; stack: Stack | null }>(
      NOTES_ENDPOINTS.getNoteWithStack(noteId),
      { showLoader }
    );
    if ('data' in response.data && typeof (response.data as NoteWithStackResponse).data === 'object') {
      return (response.data as NoteWithStackResponse).data;
    }
    return response.data as { note: Note; stack: Stack | null };
  }

  async getNotebooksWithStacks(
    showLoader = true
  ): Promise<NotebooksWithStacksResponse | Array<{ stack: Stack; notebooks: Notebook[] }>> {
    const response = await httpService.get<Array<{ stack: Stack; notebooks: Notebook[] }>>(
      NOTES_ENDPOINTS.getNotebooksWithStacks,
      { showLoader }
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as NotebooksWithStacksResponse).data || [];
  }
}

export default new NoteService();

