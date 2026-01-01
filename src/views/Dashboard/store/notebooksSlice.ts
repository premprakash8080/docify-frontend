import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import noteService from '../services/note.service';
import type {
  Notebook,
  FetchNotebooksParams,
  NotebooksResponse,
} from '../types';

export const fetchNotebooks = createAsyncThunk<
  NotebooksResponse | Notebook[],
  FetchNotebooksParams,
  { rejectValue: string }
>(
  'notebooks/fetchNotebooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await noteService.getAllNotebooks(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch notebooks');
    }
  }
);

interface NotebooksState {
  items: Notebook[];
  loading: boolean;
  error: string | null;
}

const initialState: NotebooksState = {
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
        state.error = null;
      })
      .addCase(fetchNotebooks.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response format: { success: true, data: [...] } or just [...]
        const payload = action.payload;
        if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
          // API returned { success: true, data: [...] }
          const response = payload as NotebooksResponse;
          state.items = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(payload)) {
          // API returned array directly
          state.items = payload;
        } else if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as any).data)) {
          // API returned { data: [...] }
          state.items = (payload as { data: Notebook[] }).data;
        } else {
          // Fallback to empty array
          state.items = [];
        }
      })
      .addCase(fetchNotebooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notebooks';
      });
  },
});

export const selectNotebooksItems = (state: { notesApp?: { notebooks?: NotebooksState } }): Notebook[] => {
  return state.notesApp?.notebooks?.items || [];
};

export default notebooksSlice.reducer;

