import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import noteService from '../services/note.service';
import type {
  Note,
  FetchNotesParams,
  CreateNotePayload,
  NotesResponse,
} from '../types';

export const fetchNotes = createAsyncThunk<
  NotesResponse | Note[],
  FetchNotesParams,
  { rejectValue: string }
>('notes/fetchNotes', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await noteService.getAllNotes(params);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch notes');
  }
});

export const createNote = createAsyncThunk<
  { success: boolean; msg: string; data: { note: Note } } | Note,
  CreateNotePayload,
  { rejectValue: string }
>('notes/createNote', async (data, { rejectWithValue }) => {
  try {
    const response = await noteService.createNote(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to create note');
  }
});

interface NotesState {
  items: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  analytics: {
    totalNotes: number;
    pinnedNotes: number;
  };
}

const initialState: NotesState = {
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
    setSelectedNote: (state, action: PayloadAction<Note>) => {
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
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response format: { success: true, data: [...] } or just [...]
        const payload = action.payload;
        if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
          // API returned { success: true, data: [...] }
          const response = payload as NotesResponse;
          state.items = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(payload)) {
          // API returned array directly
          state.items = payload;
        } else {
          // Fallback to empty array
          state.items = [];
        }
        state.analytics.totalNotes = state.items.length;
        state.analytics.pinnedNotes = state.items.filter((note) => note.pinned).length;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notes';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        let newNote: Note;
        const payload = action.payload;
        if (payload && typeof payload === 'object' && 'data' in payload) {
          // API returned { success: true, data: { note: {...} } }
          newNote = (payload as { data: { note: Note } }).data.note;
        } else if (payload && typeof payload === 'object' && 'id' in payload) {
          // API returned note directly
          newNote = payload as Note;
        } else {
          return; // Invalid payload, don't add anything
        }
        state.items.unshift(newNote);
        state.analytics.totalNotes = state.items.length;
      });
  },
});

export const { setSelectedNote, clearSelectedNote } = notesSlice.actions;

// Selectors with proper typing
export const selectNotesItems = (state: { notesApp?: { notes?: NotesState } }): Note[] => {
  return state.notesApp?.notes?.items || [];
};

export const selectNotesLoading = (state: { notesApp?: { notes?: NotesState } }): boolean => {
  return state.notesApp?.notes?.loading || false;
};

export const selectNotesAnalytics = (state: { notesApp?: { notes?: NotesState } }): { totalNotes: number; pinnedNotes: number } => {
  return state.notesApp?.notes?.analytics || { totalNotes: 0, pinnedNotes: 0 };
};

export default notesSlice.reducer;

