import apiConfig from '../../../configs/apiConfig';

const API_BASE = apiConfig.baseURL;

export const ENDPOINTS = {
  getAllNotes: `${API_BASE}/notes/getAllNotes`,
  createNote: `${API_BASE}/notes`,
  updateNote: (noteId) => `${API_BASE}/notes/${noteId}`,
  deleteNote: (noteId) => `${API_BASE}/notes/${noteId}`,
  getAllNotebooks: `${API_BASE}/notebooks/list`,
};

