import apiConfig from '../../../configs/apiConfig';

const API_BASE = apiConfig.baseURL;

export const ENDPOINTS = {
  getAllFiles: `${API_BASE}/files`,
  getFileById: (fileId) => `${API_BASE}/files/${fileId}`,
  uploadFile: `${API_BASE}/files`,
  updateFileMetadata: (fileId) => `${API_BASE}/files/${fileId}`,
  deleteFile: (fileId) => `${API_BASE}/files/${fileId}`,
  attachFileToNote: (fileId, noteId) => `${API_BASE}/files/${fileId}/note/${noteId}`,
  detachFileFromNote: (fileId) => `${API_BASE}/files/${fileId}/note`,
};

