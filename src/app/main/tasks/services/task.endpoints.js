import apiConfig from '../../../configs/apiConfig';

const API_BASE = apiConfig.baseURL;

export const ENDPOINTS = {
  getAllTasks: `${API_BASE}/tasks/getAllTasks`,
  getTaskById: `${API_BASE}/tasks/getTaskById`,
  getNoteTasks: `${API_BASE}/tasks/getNoteTasks`,
  createTask: `${API_BASE}/tasks/createTask`,
  updateTask: `${API_BASE}/tasks/updateTask`,
  toggleTaskComplete: `${API_BASE}/tasks/toggleTaskComplete`,
  deleteTask: `${API_BASE}/tasks/deleteTask`,
  reorderTasks: `${API_BASE}/tasks/reorder`,
};
