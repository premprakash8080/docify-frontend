import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import notebookService from '../services/notebook.service';
import type {
  NotebooksState,
  CreateStackPayload,
  UpdateStackPayload,
  CreateNotebookPayload,
  UpdateNotebookPayload,
  StackWithNotebooks,
  NotebookWithNotes,
  Stack,
  Notebook,
} from '../types';
import type { Note } from '@/views/Dashboard/types';

export const fetchStacks = createAsyncThunk(
  'notebooks/fetchStacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notebookService.getAllStacks();
      // Handle response format: { success: true, data: { stacks: [...], count: 1 } }
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const data = (response.data as { data: { stacks: Stack[]; count: number } }).data;
        return data;
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to fetch stacks');
    }
  }
);

export const fetchNotebooks = createAsyncThunk(
  'notebooks/fetchNotebooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notebookService.getAllNotebooks();
      // Handle response format: { success: true, data: { notebooks: [...], count: 2 } }
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const data = (response.data as { data: { notebooks: Notebook[]; count: number } }).data;
        return data;
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to fetch notebooks');
    }
  }
);

export const fetchNotebookNotes = createAsyncThunk(
  'notebooks/fetchNotebookNotes',
  async (notebookId: string, { rejectWithValue }) => {
    try {
      const response = await notebookService.getNotebookNotesById(notebookId);
      // Extract notes from response structure: { success: true, data: { notebook: {...}, notes: [...], count: 1 } }
      const notes = response.data?.data?.notes || [];
      return { notebookId, data: notes };
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to fetch notes');
    }
  }
);

export const updateStack = createAsyncThunk(
  'notebooks/updateStack',
  async ({ id, data }: { id: string; data: UpdateStackPayload }, { rejectWithValue }) => {
    try {
      const response = await notebookService.updateStack(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to update stack');
    }
  }
);

export const deleteStack = createAsyncThunk(
  'notebooks/deleteStack',
  async (id: string, { rejectWithValue }) => {
    try {
      await notebookService.deleteStack(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to delete stack');
    }
  }
);

export const createStack = createAsyncThunk(
  'notebooks/createStack',
  async (data: CreateStackPayload, { rejectWithValue }) => {
    try {
      const response = await notebookService.createStack(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to create stack');
    }
  }
);

export const createNotebook = createAsyncThunk(
  'notebooks/createNotebook',
  async (data: CreateNotebookPayload, { rejectWithValue }) => {
    try {
      const response = await notebookService.createNotebook(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to create notebook');
    }
  }
);

export const updateNotebook = createAsyncThunk(
  'notebooks/updateNotebook',
  async ({ id, data }: { id: string; data: UpdateNotebookPayload }, { rejectWithValue }) => {
    try {
      const response = await notebookService.updateNotebook(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to update notebook');
    }
  }
);

export const deleteNotebook = createAsyncThunk(
  'notebooks/deleteNotebook',
  async (id: string, { rejectWithValue }) => {
    try {
      await notebookService.deleteNotebook(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to delete notebook');
    }
  }
);

export const moveNotebookToStack = createAsyncThunk(
  'notebooks/moveNotebookToStack',
  async (
    { notebookId, stackId }: { notebookId: string; stackId: string | null },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await notebookService.moveNotebookToStack(notebookId, stackId);
      // Refresh data after moving
      dispatch(fetchNotebooks());
      dispatch(fetchStacks());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to move notebook to stack');
    }
  }
);

const initialState: NotebooksState = {
  stacks: [],
  standaloneNotebooks: [],
  loading: false,
  error: null,
  expandedStacks: {},
  expandedNotebooks: {},
  searchText: '',
  renameStackDialog: { open: false, stack: null },
  deleteStackDialog: { open: false, stack: null },
  addNotebookDialog: { open: false, stack: null },
  renameNotebookDialog: { open: false, notebook: null },
  deleteNotebookDialog: { open: false, notebook: null },
  moveNotebookDialog: { open: false, notebook: null },
  renameNoteDialog: { open: false, note: null },
  deleteNoteDialog: { open: false, note: null },
  moveNoteDialog: { open: false, note: null },
};

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState,
  reducers: {
    toggleStackExpanded: (state, action: PayloadAction<string>) => {
      const stackId = action.payload;
      state.expandedStacks[stackId] = !state.expandedStacks[stackId];
    },
    toggleNotebookExpanded: (state, action: PayloadAction<string>) => {
      const notebookId = action.payload;
      state.expandedNotebooks[notebookId] = !state.expandedNotebooks[notebookId];
    },
    openRenameStackDialog: (state, action: PayloadAction<StackWithNotebooks>) => {
      state.renameStackDialog = { open: true, stack: action.payload };
    },
    closeRenameStackDialog: (state) => {
      state.renameStackDialog = { open: false, stack: null };
    },
    openDeleteStackDialog: (state, action: PayloadAction<StackWithNotebooks>) => {
      state.deleteStackDialog = { open: true, stack: action.payload };
    },
    closeDeleteStackDialog: (state) => {
      state.deleteStackDialog = { open: false, stack: null };
    },
    openAddNotebookDialog: (state, action: PayloadAction<StackWithNotebooks | null>) => {
      state.addNotebookDialog = { open: true, stack: action.payload };
    },
    closeAddNotebookDialog: (state) => {
      state.addNotebookDialog = { open: false, stack: null };
    },
    openRenameNotebookDialog: (state, action: PayloadAction<NotebookWithNotes>) => {
      state.renameNotebookDialog = { open: true, notebook: action.payload };
    },
    closeRenameNotebookDialog: (state) => {
      state.renameNotebookDialog = { open: false, notebook: null };
    },
    openDeleteNotebookDialog: (state, action: PayloadAction<NotebookWithNotes>) => {
      state.deleteNotebookDialog = { open: true, notebook: action.payload };
    },
    closeDeleteNotebookDialog: (state) => {
      state.deleteNotebookDialog = { open: false, notebook: null };
    },
    openMoveNotebookDialog: (state, action: PayloadAction<NotebookWithNotes>) => {
      state.moveNotebookDialog = { open: true, notebook: action.payload };
    },
    closeMoveNotebookDialog: (state) => {
      state.moveNotebookDialog = { open: false, notebook: null };
    },
    openRenameNoteDialog: (state, action: PayloadAction<Note>) => {
      state.renameNoteDialog = { open: true, note: action.payload };
    },
    closeRenameNoteDialog: (state) => {
      state.renameNoteDialog = { open: false, note: null };
    },
    openDeleteNoteDialog: (state, action: PayloadAction<Note>) => {
      state.deleteNoteDialog = { open: true, note: action.payload };
    },
    closeDeleteNoteDialog: (state) => {
      state.deleteNoteDialog = { open: false, note: null };
    },
    openMoveNoteDialog: (state, action: PayloadAction<Note>) => {
      state.moveNoteDialog = { open: true, note: action.payload };
    },
    closeMoveNoteDialog: (state) => {
      state.moveNoteDialog = { open: false, note: null };
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStacks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStacks.fulfilled, (state, action) => {
        state.loading = false;
        const { payload } = action;
        // Handle response format: { stacks: [...], count: 1 }
        if (payload?.stacks && Array.isArray(payload.stacks)) {
          state.stacks = payload.stacks as StackWithNotebooks[];
        } else if (Array.isArray(payload)) {
          state.stacks = payload as StackWithNotebooks[];
        } else {
          state.stacks = [];
        }
      })
      .addCase(fetchStacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNotebooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotebooks.fulfilled, (state, action) => {
        state.loading = false;
        const { payload } = action;
        // Handle response format: { notebooks: [...], count: 2 }
        let allNotebooks: Notebook[] = [];
        if (payload?.notebooks && Array.isArray(payload.notebooks)) {
          allNotebooks = payload.notebooks;
        } else if (Array.isArray(payload)) {
          allNotebooks = payload;
        }
        
        // Notebooks without stack_id go to standaloneNotebooks
        // Note: stack_id can be null or undefined
        state.standaloneNotebooks = allNotebooks.filter(
          (nb) => !nb.stack_id || nb.stack_id === null
        ) as NotebookWithNotes[];
        
        // Note: Stacks already have their notebooks from fetchStacks API
        // We don't need to update stacks here since the stacks API response includes notebooks
      })
      .addCase(fetchNotebooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNotebookNotes.fulfilled, (state, action) => {
        const { notebookId, data } = action.payload;
        let notes: Note[] = [];
        if (data && Array.isArray(data)) {
          notes = data;
        } else if (data?.data && Array.isArray(data.data)) {
          notes = data.data;
        }
        state.stacks = state.stacks.map((stack) => ({
          ...stack,
          notebooks:
            stack.notebooks?.map((nb) => (nb.id === notebookId ? { ...nb, notes } : nb)) || [],
        }));
        state.standaloneNotebooks = state.standaloneNotebooks.map((nb) =>
          nb.id === notebookId ? { ...nb, notes } : nb
        );
      })
      .addCase(updateStack.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const updatedStack = payload?.data?.stack || payload?.stack || payload;
        if (updatedStack && updatedStack.id) {
          state.stacks = state.stacks.map((stack) =>
            stack.id === updatedStack.id ? { ...stack, ...updatedStack } : stack
          );
        }
        state.renameStackDialog = { open: false, stack: null };
      })
      .addCase(deleteStack.fulfilled, (state, action) => {
        state.stacks = state.stacks.filter((stack) => stack.id !== action.payload);
        state.deleteStackDialog = { open: false, stack: null };
      })
      .addCase(createStack.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const newStack = payload?.data?.stack || payload?.stack || payload;
        if (newStack && newStack.id) {
          state.stacks.push(newStack as StackWithNotebooks);
        }
      })
      .addCase(createNotebook.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const newNotebook = payload?.data?.notebook || payload?.notebook || payload;
        if (newNotebook && newNotebook.id) {
          if (newNotebook.stack_id) {
            state.stacks = state.stacks.map((stack) =>
              stack.id === newNotebook.stack_id
                ? { ...stack, notebooks: [...(stack.notebooks || []), newNotebook as NotebookWithNotes] }
                : stack
            );
          } else {
            state.standaloneNotebooks.push(newNotebook as NotebookWithNotes);
          }
        }
        state.addNotebookDialog = { open: false, stack: null };
      })
      .addCase(updateNotebook.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const updatedNotebook = payload?.data?.notebook || payload?.notebook || payload;
        if (updatedNotebook && updatedNotebook.id) {
          state.stacks = state.stacks.map((stack) => ({
            ...stack,
            notebooks:
              stack.notebooks?.map((nb) =>
                nb.id === updatedNotebook.id ? { ...nb, ...updatedNotebook } : nb
              ) || [],
          }));
          state.standaloneNotebooks = state.standaloneNotebooks.map((nb) =>
            nb.id === updatedNotebook.id ? { ...nb, ...updatedNotebook } : nb
          );
        }
        state.renameNotebookDialog = { open: false, notebook: null };
      })
      .addCase(deleteNotebook.fulfilled, (state, action) => {
        state.stacks = state.stacks.map((stack) => ({
          ...stack,
          notebooks: stack.notebooks?.filter((nb) => nb.id !== action.payload) || [],
        }));
        state.standaloneNotebooks = state.standaloneNotebooks.filter((nb) => nb.id !== action.payload);
        state.deleteNotebookDialog = { open: false, notebook: null };
      });
  },
});

export const {
  toggleStackExpanded,
  toggleNotebookExpanded,
  openRenameStackDialog,
  closeRenameStackDialog,
  openDeleteStackDialog,
  closeDeleteStackDialog,
  openAddNotebookDialog,
  closeAddNotebookDialog,
  openRenameNotebookDialog,
  closeRenameNotebookDialog,
  openDeleteNotebookDialog,
  closeDeleteNotebookDialog,
  openMoveNotebookDialog,
  closeMoveNotebookDialog,
  openRenameNoteDialog,
  closeRenameNoteDialog,
  openDeleteNoteDialog,
  closeDeleteNoteDialog,
  openMoveNoteDialog,
  closeMoveNoteDialog,
  setSearchText,
} = notebooksSlice.actions;

export const selectStacks = (state: any): StackWithNotebooks[] =>
  state.notebooksApp?.notebooks?.stacks || [];
export const selectStandaloneNotebooks = (state: any): NotebookWithNotes[] =>
  state.notebooksApp?.notebooks?.standaloneNotebooks || [];
export const selectNotebooksLoading = (state: any): boolean =>
  state.notebooksApp?.notebooks?.loading || false;
export const selectExpandedStacks = (state: any): Record<string, boolean> =>
  state.notebooksApp?.notebooks?.expandedStacks || {};
export const selectExpandedNotebooks = (state: any): Record<string, boolean> =>
  state.notebooksApp?.notebooks?.expandedNotebooks || {};

export default notebooksSlice.reducer;

