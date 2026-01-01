import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import taskService from '../services/task.service';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  console.log('fetchTasks thunk started');
  try {
    console.log('Calling taskService.getAllTasks()');
    const response = await taskService.getAllTasks();
    console.log('Tasks API Response:', response);
    console.log('Tasks API Response Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Tasks API Error:', error);
    console.error('Tasks API Error Response:', error.response);
    console.error('Tasks API Error URL:', error.config?.url);
    console.error('Tasks API Error Status:', error.response?.status);
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (data, { rejectWithValue }) => {
  try {
    const response = await taskService.createTask(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async (data, { rejectWithValue }) => {
  try {
    const response = await taskService.updateTask(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to update task');
  }
});

export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleTaskComplete',
  async ({ id, completed }, { rejectWithValue }) => {
    try {
      const response = await taskService.toggleTaskComplete(id, completed);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to toggle task');
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await taskService.deleteTask(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to delete task');
  }
});

const initialState = {
  items: [],
  selectedTask: null,
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Handle API response format: { success: true, data: { tasks: [...], count: 3 } }
        if (payload?.success && payload?.data?.tasks) {
          state.items = Array.isArray(payload.data.tasks) ? payload.data.tasks : [];
        } else if (payload?.data && Array.isArray(payload.data)) {
          // If data is directly an array
          state.items = payload.data;
        } else if (Array.isArray(payload)) {
          // If payload is directly an array
          state.items = payload;
        } else {
          state.items = [];
        }
        console.log('Tasks loaded:', state.items.length, 'items');
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, { payload }) => {
        if (payload?.success && payload?.data?.task) {
          state.items.unshift(payload.data.task);
        }
      })
      .addCase(updateTask.fulfilled, (state, { payload }) => {
        if (payload?.success && payload?.data?.task) {
          const index = state.items.findIndex((item) => item.id === payload.data.task.id);
          if (index !== -1) {
            state.items[index] = payload.data.task;
          }
        }
      })
      .addCase(toggleTaskComplete.fulfilled, (state, { payload }) => {
        if (payload?.success && payload?.data?.task) {
          const index = state.items.findIndex((item) => item.id === payload.data.task.id);
          if (index !== -1) {
            state.items[index].completed = payload.data.task.completed;
          }
        }
      })
      .addCase(deleteTask.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((item) => item.id !== payload);
      });
  },
});

export const { setSelectedTask, clearSelectedTask } = tasksSlice.actions;
export const selectTasks = (state) => state.tasksApp?.tasks?.items || [];
export const selectTasksLoading = (state) => state.tasksApp?.tasks?.loading || false;
export const selectSelectedTask = (state) => state.tasksApp?.tasks?.selectedTask;

export default tasksSlice.reducer;

