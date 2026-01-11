import httpService from '@/core/http';
import { DELETE_NOTE_ENDPOINTS } from './deleteNote.endpoints';

class DeleteNoteService {
  async deleteNote(id: string, showLoader = true): Promise<{ success: boolean; msg?: string }> {
    const response = await httpService.delete(DELETE_NOTE_ENDPOINTS.deleteNote, { id }, { showLoader });
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg?: string };
    }
    
    return { success: true, msg: (response.data as { msg?: string })?.msg || 'Note deleted successfully' };
  }
}

export default new DeleteNoteService();
