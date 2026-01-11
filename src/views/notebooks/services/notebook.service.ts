import httpService from '@/core/http';
import { ENDPOINTS } from './notebook.endpoints';
import type {
  CreateStackPayload,
  UpdateStackPayload,
  CreateNotebookPayload,
  UpdateNotebookPayload,
  MoveNotebookPayload,
  Stack,
  Notebook,
} from '../types';

class NotebookService {
  getAllStacks(showLoader = true) {
    return httpService.get<{ stacks: Stack[]; count: number }>(ENDPOINTS.getAllStacks, { showLoader });
  }

  getAllNotebooks(showLoader = true) {
    return httpService.post<{ notebooks: Notebook[]; count: number }>(
      ENDPOINTS.getAllNotebooks,
      {},
      { showLoader }
    );
  }

  getStackNotebooks(stackId: string, showLoader = true) {
    return httpService.post<{ notebooks: Notebook[] }>(
      ENDPOINTS.getStackNotebooks(stackId),
      { id: stackId },
      { showLoader }
    );
  }

  getNotebookNotes(notebookId: string, showLoader = true) {
    return httpService.get(ENDPOINTS.getNotebookNotes(notebookId), { showLoader });
  }

  getNotebookNotesById(notebookId: string, showLoader = true) {
    return httpService.get<{
      success: boolean;
      data: {
        notebook: {
          id: string;
          name: string;
          description: string | null;
        };
        notes: any[];
        count: number;
      };
    }>(`${ENDPOINTS.getNotebookNotesById}?id=${notebookId}`, { showLoader });
  }

  createStack(data: CreateStackPayload, showLoader = true) {
    return httpService.post<{ stack: Stack }>(ENDPOINTS.createStack, data, { showLoader });
  }

  updateStack(stackId: string, data: UpdateStackPayload, showLoader = true) {
    return httpService.put<{ stack: Stack }>(
      ENDPOINTS.updateStack(stackId),
      { id: stackId, ...data },
      { showLoader }
    );
  }

  deleteStack(stackId: string, showLoader = true) {
    return httpService.delete(ENDPOINTS.deleteStack(stackId), { showLoader });
  }

  createNotebook(data: CreateNotebookPayload, showLoader = true) {
    return httpService.post<{ notebook: Notebook }>(ENDPOINTS.createNotebook, data, { showLoader });
  }

  updateNotebook(notebookId: string, data: UpdateNotebookPayload, showLoader = true) {
    return httpService.put<{ notebook: Notebook }>(
      ENDPOINTS.updateNotebook(notebookId),
      { id: notebookId, ...data },
      { showLoader }
    );
  }

  deleteNotebook(notebookId: string, showLoader = true) {
    return httpService.delete(ENDPOINTS.deleteNotebook(notebookId), { showLoader });
  }

  moveNotebookToStack(notebookId: string, stackId: string | null, showLoader = true) {
    return httpService.put<{ success: boolean }>(
      ENDPOINTS.moveNotebookToStack,
      {
        id: notebookId,
        stack_id: stackId !== null && stackId !== undefined ? stackId : null,
      },
      { showLoader }
    );
  }
}

export default new NotebookService();

