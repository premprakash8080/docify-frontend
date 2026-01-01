import axios from 'axios';
import apiConfig from '../../../configs/apiConfig';
import { ENDPOINTS } from './note.endpoints';

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

class NoteService {
  constructor() {
    this.httpService = axiosInstance;
  }

  getAllNotes(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.notebook_id) queryParams.append('notebook_id', params.notebook_id);
    if (params.archived !== undefined) queryParams.append('archived', params.archived);
    if (params.trashed !== undefined) queryParams.append('trashed', params.trashed);
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.getAllNotes}?${queryString}` : ENDPOINTS.getAllNotes;
    return this.httpService.get(url);
  }

  createNote(data) {
    return this.httpService.post(ENDPOINTS.createNote, {
      title: data.title || 'Untitled Note',
      notebook_id: data.notebook_id || null,
    });
  }

  getAllNotebooks(params = {}) {
    return this.httpService.post(ENDPOINTS.getAllNotebooks, {
      stack_id: params.stack_id || null,
      archived: params.archived || false,
      trashed: params.trashed || false,
    });
  }

  updateNote(noteId, data) {
    return this.httpService.put(ENDPOINTS.updateNote(noteId), data);
  }

  deleteNote(noteId) {
    return this.httpService.delete(ENDPOINTS.deleteNote(noteId));
  }
}

export default new NoteService();

