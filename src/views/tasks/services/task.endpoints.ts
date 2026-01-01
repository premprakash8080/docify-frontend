/**
 * Task API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const TASK_ENDPOINTS = {
  getAllTasks: '/tasks/getAllTasks',
  getTaskById: '/tasks/getTaskById',
  createTask: '/tasks/createTask',
  updateTask: '/tasks/updateTask',
  toggleTaskComplete: '/tasks/toggleTaskComplete',
  deleteTask: '/tasks/deleteTask',
  reorderTasks: '/tasks/reorder',
} as const;

