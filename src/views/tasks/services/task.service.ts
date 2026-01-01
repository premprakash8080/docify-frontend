import httpService from '@/core/http';
import { TASK_ENDPOINTS } from './task.endpoints';
import type {
  Task,
  TasksResponse,
  TaskResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  ToggleTaskCompletePayload,
  DeleteTaskPayload,
} from '../types';

/**
 * Task Service - Using centralized HttpService
 * 
 * Handles all task-related API calls:
 * - CRUD operations
 * - Toggle completion status
 * - Reorder tasks
 */
class TaskService {
  /**
   * Get all tasks
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Tasks response with tasks array and count
   */
  async getAllTasks(showLoader = true): Promise<TasksResponse> {
    const response = await httpService.get<{ tasks: Task[]; count: number }>(
      TASK_ENDPOINTS.getAllTasks,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TasksResponse;
    }
    return {
      success: true,
      msg: 'Tasks fetched successfully',
      data: response.data as { tasks: Task[]; count: number },
    };
  }

  /**
   * Get task by ID
   * @param taskId - Task ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Task response
   */
  async getTaskById(taskId: number, showLoader = true): Promise<TaskResponse> {
    const response = await httpService.get<{ task: Task }>(
      `${TASK_ENDPOINTS.getTaskById}?id=${taskId}`,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TaskResponse;
    }
    return {
      success: true,
      msg: 'Task fetched successfully',
      data: response.data as { task: Task },
    };
  }

  /**
   * Create a new task
   * @param payload - Task creation data
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Task response
   */
  async createTask(payload: CreateTaskPayload, showLoader = true): Promise<TaskResponse> {
    const response = await httpService.post<{ task: Task }>(
      TASK_ENDPOINTS.createTask,
      payload,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TaskResponse;
    }
    return {
      success: true,
      msg: 'Task created successfully',
      data: response.data as { task: Task },
    };
  }

  /**
   * Update an existing task
   * @param payload - Task update data
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Task response
   */
  async updateTask(payload: UpdateTaskPayload, showLoader = true): Promise<TaskResponse> {
    const response = await httpService.put<{ task: Task }>(
      TASK_ENDPOINTS.updateTask,
      payload,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TaskResponse;
    }
    return {
      success: true,
      msg: 'Task updated successfully',
      data: response.data as { task: Task },
    };
  }

  /**
   * Toggle task completion status
   * @param payload - Task ID and completion status
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Task response
   */
  async toggleTaskComplete(
    payload: ToggleTaskCompletePayload,
    showLoader = true
  ): Promise<TaskResponse> {
    const response = await httpService.put<{ task: Task }>(
      TASK_ENDPOINTS.toggleTaskComplete,
      payload,
      { showLoader }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as TaskResponse;
    }
    return {
      success: true,
      msg: 'Task completion status updated',
      data: response.data as { task: Task },
    };
  }

  /**
   * Delete a task
   * @param payload - Task ID
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async deleteTask(payload: DeleteTaskPayload, showLoader = true): Promise<{ success: boolean; msg: string }> {
    const response = await httpService.delete<unknown>(
      TASK_ENDPOINTS.deleteTask,
      {
        data: payload,
        showLoader,
      }
    );

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'Task deleted successfully',
    };
  }
}

export default new TaskService();

