import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import noteService from '../services/note.service';

export const fetchNotebooks = createAsyncThunk(
  'notebooks/fetchNotebooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await noteService.getAllNotebooks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch notebooks');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotebooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotebooks.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response format: { success: true, data: [...] } or just [...]
        const { payload } = action;
        if (payload?.success && payload?.data) {
          // API returned { success: true, data: [...] }
          state.items = Array.isArray(payload.data) ? payload.data : [];
        } else if (Array.isArray(payload)) {
          // API returned array directly
          state.items = payload;
        } else if (payload?.data && Array.isArray(payload.data)) {
          // API returned { data: [...] }
          state.items = payload.data;
        } else {
          // Fallback to empty array
          state.items = [];
        }
      })
      .addCase(fetchNotebooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectNotebooksItems = (state) => state.notesApp?.notebooks?.items || [];

export default notebooksSlice.reducer;

