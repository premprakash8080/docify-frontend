import apiConfig from '../../../configs/apiConfig';

const API_BASE = apiConfig.baseURL;

export const ENDPOINTS = {
  getAllStacks: `${API_BASE}/stacks`,
  createStack: `${API_BASE}/stacks`,
  updateStack: (stackId) => `${API_BASE}/stacks/${stackId}`,
  deleteStack: (stackId) => `${API_BASE}/stacks/${stackId}`,
  getAllNotebooks: `${API_BASE}/notebooks/list`,
  createNotebook: `${API_BASE}/notebooks/createNotebook`,
  updateNotebook: (notebookId) => `${API_BASE}/notebooks/${notebookId}`,
  deleteNotebook: (notebookId) => `${API_BASE}/notebooks/${notebookId}`,
  moveNotebookToStack: `${API_BASE}/notebooks/stack/updateNotebookStack`,
  getStackNotebooks: (stackId) => `${API_BASE}/stacks/${stackId}/notebooks`,
  getNotebookNotes: (notebookId) => `${API_BASE}/notebooks/${notebookId}/notes`,
};

