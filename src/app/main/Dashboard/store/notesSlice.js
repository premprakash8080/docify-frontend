import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import noteService from '../services/note.service';

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await noteService.getAllNotes(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch notes');
  }
});

export const createNote = createAsyncThunk('notes/createNote', async (data, { rejectWithValue }) => {
  try {
    const response = await noteService.createNote(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to create note');
  }
});

const initialState = {
  items: [],
  selectedNote: null,
  loading: false,
  error: null,
  analytics: {
    totalNotes: 0,
    pinnedNotes: 0,
  },
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNote: (state, action) => {
      state.selectedNote = action.payload;
    },
    clearSelectedNote: (state) => {
      state.selectedNote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
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
        state.analytics.totalNotes = state.items.length;
        state.analytics.pinnedNotes = state.items.filter((note) => note.pinned).length;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        const newNote = action.payload.data || action.payload;
        state.items.unshift(newNote);
        state.analytics.totalNotes = state.items.length;
      });
  },
});

export const { setSelectedNote, clearSelectedNote } = notesSlice.actions;
export const selectNotesItems = (state) => state.notesApp?.notes?.items || [];
export const selectNotesLoading = (state) => state.notesApp?.notes?.loading || false;
export const selectNotesAnalytics = (state) => state.notesApp?.notes?.analytics || { totalNotes: 0, pinnedNotes: 0 };

export default notesSlice.reducer;

