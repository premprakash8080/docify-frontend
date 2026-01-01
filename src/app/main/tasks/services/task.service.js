import axios from 'axios';
import apiConfig from '../../../configs/apiConfig';
import { ENDPOINTS } from './task.endpoints';

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

class TaskService {
  constructor() {
    this.httpService = axiosInstance;
  }

  getAllTasks() {
    return this.httpService.get(ENDPOINTS.getAllTasks);
  }

  getTaskById(id) {
    const params = { id };
    const queryString = new URLSearchParams(params).toString();
    return this.httpService.get(`${ENDPOINTS.getTaskById}?${queryString}`);
  }

  getNoteTasks(noteId) {
    const params = { note_id: noteId };
    const queryString = new URLSearchParams(params).toString();
    return this.httpService.get(`${ENDPOINTS.getNoteTasks}?${queryString}`);
  }

  createTask(data) {
    return this.httpService.post(ENDPOINTS.createTask, {
      note_id: data.note_id || null,
      label: data.label,
      description: data.description || null,
      due_date: data.due_date || null,
      start_date: data.start_date || null,
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      reminder: data.reminder || null,
      assigned_to: data.assigned_to || null,
      priority: data.priority || null,
      flagged: data.flagged || false,
      sort_order: data.sort_order || null,
      completed: data.completed || false,
    });
  }

  updateTask(data) {
    return this.httpService.put(ENDPOINTS.updateTask, {
      id: data.id,
      label: data.label,
      description: data.description,
      due_date: data.due_date,
      start_date: data.start_date,
      start_time: data.start_time,
      end_time: data.end_time,
      reminder: data.reminder,
      assigned_to: data.assigned_to,
      priority: data.priority,
      flagged: data.flagged,
      sort_order: data.sort_order,
    });
  }

  toggleTaskComplete(id, completed) {
    return this.httpService.put(ENDPOINTS.toggleTaskComplete, {
      id,
      completed,
    });
  }

  deleteTask(id) {
    return this.httpService.delete(ENDPOINTS.deleteTask, {
      data: { id },
    });
  }

  reorderTasks(tasks) {
    return this.httpService.put(ENDPOINTS.reorderTasks, {
      tasks,
    });
  }
}

export default new TaskService();

