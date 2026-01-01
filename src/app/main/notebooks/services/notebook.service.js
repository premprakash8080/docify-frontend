import axios from 'axios';
import apiConfig from '../../../configs/apiConfig';
import { ENDPOINTS } from './notebook.endpoints';

// Create a separate axios instance to bypass mock adapter
const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout || 30000,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class NotebookService {
  constructor() {
    this.httpService = axiosInstance;
  }

  getAllStacks() {
    return this.httpService.get(ENDPOINTS.getAllStacks);
  }

  getAllNotebooks(params = {}) {
    return this.httpService.post(ENDPOINTS.getAllNotebooks, {
      stack_id: params.stack_id || null,
      archived: params.archived || false,
      trashed: params.trashed || false,
    });
  }

  getStackNotebooks(stackId) {
    return this.httpService.post(ENDPOINTS.getStackNotebooks(stackId), {
      id: stackId,
    });
  }

  getNotebookNotes(notebookId) {
    return this.httpService.get(ENDPOINTS.getNotebookNotes(notebookId));
  }

  createStack(data) {
    return this.httpService.post(ENDPOINTS.createStack, data);
  }

  updateStack(stackId, data) {
    return this.httpService.put(ENDPOINTS.updateStack(stackId), { id: stackId, ...data });
  }

  deleteStack(stackId) {
    return this.httpService.delete(ENDPOINTS.deleteStack(stackId));
  }

  createNotebook(data) {
    return this.httpService.post(ENDPOINTS.createNotebook, data);
  }

  updateNotebook(notebookId, data) {
    return this.httpService.put(ENDPOINTS.updateNotebook(notebookId), { id: notebookId, ...data });
  }

  deleteNotebook(notebookId) {
    return this.httpService.delete(ENDPOINTS.deleteNotebook(notebookId));
  }

  moveNotebookToStack(notebookId, stackId) {
    // If stackId is null, we might need to handle it differently
    // For now, pass it as null and let the API handle it
    return this.httpService.put(ENDPOINTS.moveNotebookToStack, {
      notebook_id: notebookId,
      stack_id: stackId !== null && stackId !== undefined ? stackId : null,
    });
  }
}

export default new NotebookService();

