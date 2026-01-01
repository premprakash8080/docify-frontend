import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import taskService from '../services/task.service';
import type {
  Task,
  TasksResponse,
  TaskResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  ToggleTaskCompletePayload,
  DeleteTaskPayload,
} from '../types';

// Async thunks
export const fetchTasks = createAsyncThunk<
  TasksResponse,
  void,
  { rejectValue: string }
>('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await taskService.getAllTasks();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to fetch tasks');
  }
});

export const fetchTaskById = createAsyncThunk<
  TaskResponse,
  number,
  { rejectValue: string }
>('tasks/fetchTaskById', async (taskId, { rejectWithValue }) => {
  try {
    const response = await taskService.getTaskById(taskId);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to fetch task');
  }
});

export const createTask = createAsyncThunk<
  TaskResponse,
  CreateTaskPayload,
  { rejectValue: string }
>('tasks/createTask', async (payload, { rejectWithValue }) => {
  try {
    const response = await taskService.createTask(payload);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk<
  TaskResponse,
  UpdateTaskPayload,
  { rejectValue: string }
>('tasks/updateTask', async (payload, { rejectWithValue }) => {
  try {
    const response = await taskService.updateTask(payload);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to update task');
  }
});

export const toggleTaskComplete = createAsyncThunk<
  TaskResponse,
  ToggleTaskCompletePayload,
  { rejectValue: string }
>('tasks/toggleTaskComplete', async (payload, { rejectWithValue }) => {
  try {
    const response = await taskService.toggleTaskComplete(payload);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to toggle task completion');
  }
});

export const deleteTask = createAsyncThunk<
  { success: boolean; msg: string },
  DeleteTaskPayload,
  { rejectValue: string }
>('tasks/deleteTask', async (payload, { rejectWithValue }) => {
  try {
    const response = await taskService.deleteTask(payload);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to delete task');
  }
});

// State interface
interface TasksState {
  items: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  count: number;
}

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  loading: false,
  error: null,
  count: 0,
};

// Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task>) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data?.tasks) {
          state.items = payload.data.tasks;
          state.count = payload.data.count || payload.data.tasks.length;
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tasks';
      })
      // Fetch task by ID
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        if (action.payload?.data?.task) {
          state.selectedTask = action.payload.data.task;
          // Update item in list if it exists
          const index = state.items.findIndex((t) => t.id === action.payload.data.task.id);
          if (index !== -1) {
            state.items[index] = action.payload.data.task;
          }
        }
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        if (action.payload?.data?.task) {
          state.items.unshift(action.payload.data.task);
          state.count += 1;
        }
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        if (action.payload?.data?.task) {
          const index = state.items.findIndex((t) => t.id === action.payload.data.task.id);
          if (index !== -1) {
            state.items[index] = action.payload.data.task;
          }
          if (state.selectedTask?.id === action.payload.data.task.id) {
            state.selectedTask = action.payload.data.task;
          }
        }
      })
      // Toggle task complete
      .addCase(toggleTaskComplete.fulfilled, (state, action) => {
        if (action.payload?.data?.task) {
          const index = state.items.findIndex((t) => t.id === action.payload.data.task.id);
          if (index !== -1) {
            state.items[index] = action.payload.data.task;
          }
          if (state.selectedTask?.id === action.payload.data.task.id) {
            state.selectedTask = action.payload.data.task;
          }
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        // Remove task from items
        const taskId = action.meta.arg.id;
        state.items = state.items.filter((t) => t.id !== taskId);
        state.count = Math.max(0, state.count - 1);
        if (state.selectedTask?.id === taskId) {
          state.selectedTask = null;
        }
      });
  },
});

export const { setSelectedTask, clearSelectedTask, clearError } = tasksSlice.actions;

// Selectors
export const selectTasksItems = (state: { tasksApp?: { tasks?: TasksState } }): Task[] => {
  return state.tasksApp?.tasks?.items || [];
};

export const selectTasksLoading = (state: { tasksApp?: { tasks?: TasksState } }): boolean => {
  return state.tasksApp?.tasks?.loading || false;
};

export const selectTasksError = (state: { tasksApp?: { tasks?: TasksState } }): string | null => {
  return state.tasksApp?.tasks?.error || null;
};

export const selectTasksCount = (state: { tasksApp?: { tasks?: TasksState } }): number => {
  return state.tasksApp?.tasks?.count || 0;
};

export const selectSelectedTask = (state: { tasksApp?: { tasks?: TasksState } }): Task | null => {
  return state.tasksApp?.tasks?.selectedTask || null;
};

export default tasksSlice.reducer;

