import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import notebookService from '../services/notebook.service';
import noteService from '../../Dashboard/services/note.service';

export const fetchStacks = createAsyncThunk('notebooks/fetchStacks', async (_, { rejectWithValue }) => {
  try {
    const response = await notebookService.getAllStacks();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch stacks');
  }
});

export const fetchNotebooks = createAsyncThunk(
  'notebooks/fetchNotebooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notebookService.getAllNotebooks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch notebooks');
    }
  }
);

export const fetchNotebookNotes = createAsyncThunk(
  'notebooks/fetchNotebookNotes',
  async (notebookId, { rejectWithValue }) => {
    try {
      const response = await noteService.getAllNotes({ notebook_id: notebookId });
      return { notebookId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch notes');
    }
  }
);

export const updateStack = createAsyncThunk('notebooks/updateStack', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await notebookService.updateStack(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to update stack');
  }
});

export const deleteStack = createAsyncThunk('notebooks/deleteStack', async (id, { rejectWithValue }) => {
  try {
    await notebookService.deleteStack(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to delete stack');
  }
});

export const createStack = createAsyncThunk('notebooks/createStack', async (data, { rejectWithValue }) => {
  try {
    const response = await notebookService.createStack(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to create stack');
  }
});

export const createNotebook = createAsyncThunk('notebooks/createNotebook', async (data, { rejectWithValue }) => {
  try {
    const response = await notebookService.createNotebook(data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to create notebook');
  }
});

export const updateNotebook = createAsyncThunk('notebooks/updateNotebook', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await notebookService.updateNotebook(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to update notebook');
  }
});

export const deleteNotebook = createAsyncThunk('notebooks/deleteNotebook', async (id, { rejectWithValue }) => {
  try {
    await notebookService.deleteNotebook(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to delete notebook');
  }
});

export const moveNotebookToStack = createAsyncThunk(
  'notebooks/moveNotebookToStack',
  async ({ notebookId, stackId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await notebookService.moveNotebookToStack(notebookId, stackId);
      // Refresh data after moving
      dispatch(fetchNotebooks({ archived: false, trashed: false }));
      dispatch(fetchStacks());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to move notebook to stack');
    }
  }
);

const initialState = {
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
    toggleStackExpanded: (state, action) => {
      const stackId = action.payload;
      state.expandedStacks[stackId] = !state.expandedStacks[stackId];
    },
    toggleNotebookExpanded: (state, action) => {
      const notebookId = action.payload;
      state.expandedNotebooks[notebookId] = !state.expandedNotebooks[notebookId];
    },
    openRenameStackDialog: (state, action) => {
      state.renameStackDialog = { open: true, stack: action.payload };
    },
    closeRenameStackDialog: (state) => {
      state.renameStackDialog = { open: false, stack: null };
    },
    openDeleteStackDialog: (state, action) => {
      state.deleteStackDialog = { open: true, stack: action.payload };
    },
    closeDeleteStackDialog: (state) => {
      state.deleteStackDialog = { open: false, stack: null };
    },
    openAddNotebookDialog: (state, action) => {
      state.addNotebookDialog = { open: true, stack: action.payload };
    },
    closeAddNotebookDialog: (state) => {
      state.addNotebookDialog = { open: false, stack: null };
    },
    openRenameNotebookDialog: (state, action) => {
      state.renameNotebookDialog = { open: true, notebook: action.payload };
    },
    closeRenameNotebookDialog: (state) => {
      state.renameNotebookDialog = { open: false, notebook: null };
    },
    openDeleteNotebookDialog: (state, action) => {
      state.deleteNotebookDialog = { open: true, notebook: action.payload };
    },
    closeDeleteNotebookDialog: (state) => {
      state.deleteNotebookDialog = { open: false, notebook: null };
    },
    openMoveNotebookDialog: (state, action) => {
      state.moveNotebookDialog = { open: true, notebook: action.payload };
    },
    closeMoveNotebookDialog: (state) => {
      state.moveNotebookDialog = { open: false, notebook: null };
    },
    openRenameNoteDialog: (state, action) => {
      state.renameNoteDialog = { open: true, note: action.payload };
    },
    closeRenameNoteDialog: (state) => {
      state.renameNoteDialog = { open: false, note: null };
    },
    openDeleteNoteDialog: (state, action) => {
      state.deleteNoteDialog = { open: true, note: action.payload };
    },
    closeDeleteNoteDialog: (state) => {
      state.deleteNoteDialog = { open: false, note: null };
    },
    openMoveNoteDialog: (state, action) => {
      state.moveNoteDialog = { open: true, note: action.payload };
    },
    closeMoveNoteDialog: (state) => {
      state.moveNoteDialog = { open: false, note: null };
    },
    setSearchText: (state, action) => {
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
        if (payload?.success && payload?.data?.stacks) {
          state.stacks = Array.isArray(payload.data.stacks) ? payload.data.stacks : [];
        } else if (Array.isArray(payload)) {
          state.stacks = payload;
        } else if (payload?.data && Array.isArray(payload.data)) {
          state.stacks = payload.data;
        } else {
          state.stacks = [];
        }
      })
      .addCase(fetchStacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNotebooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotebooks.fulfilled, (state, action) => {
        state.loading = false;
        const { payload } = action;
        let allNotebooks = [];
        if (payload?.success && payload?.data?.notebooks) {
          allNotebooks = Array.isArray(payload.data.notebooks) ? payload.data.notebooks : [];
        } else if (Array.isArray(payload)) {
          allNotebooks = payload;
        } else if (payload?.data && Array.isArray(payload.data)) {
          allNotebooks = payload.data;
        }
        state.standaloneNotebooks = allNotebooks.filter((nb) => !nb.stack_id);
        state.stacks = state.stacks.map((stack) => ({
          ...stack,
          notebooks: allNotebooks.filter((nb) => nb.stack_id === stack.id) || [],
        }));
      })
      .addCase(fetchNotebooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNotebookNotes.fulfilled, (state, action) => {
        const { notebookId, data } = action.payload;
        let notes = [];
        if (data?.success && data?.data) {
          notes = Array.isArray(data.data) ? data.data : [];
        } else if (Array.isArray(data)) {
          notes = data;
        } else if (data?.data && Array.isArray(data.data)) {
          notes = data.data;
        }
        state.stacks = state.stacks.map((stack) => ({
          ...stack,
          notebooks: stack.notebooks?.map((nb) =>
            nb.id === notebookId ? { ...nb, notes } : nb
          ) || [],
        }));
        state.standaloneNotebooks = state.standaloneNotebooks.map((nb) =>
          nb.id === notebookId ? { ...nb, notes } : nb
        );
      })
      .addCase(updateStack.fulfilled, (state, action) => {
        const updatedStack = action.payload?.data?.stack || action.payload?.stack;
        if (updatedStack) {
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
        const newStack = action.payload?.data?.stack || action.payload?.stack;
        if (newStack) {
          state.stacks.push(newStack);
        }
      })
      .addCase(createNotebook.fulfilled, (state, action) => {
        const newNotebook = action.payload?.data?.notebook || action.payload?.notebook;
        if (newNotebook) {
          if (newNotebook.stack_id) {
            state.stacks = state.stacks.map((stack) =>
              stack.id === newNotebook.stack_id
                ? { ...stack, notebooks: [...(stack.notebooks || []), newNotebook] }
                : stack
            );
          } else {
            state.standaloneNotebooks.push(newNotebook);
          }
        }
        state.addNotebookDialog = { open: false, stack: null };
      })
      .addCase(updateNotebook.fulfilled, (state, action) => {
        const updatedNotebook = action.payload?.data?.notebook || action.payload?.notebook;
        if (updatedNotebook) {
          state.stacks = state.stacks.map((stack) => ({
            ...stack,
            notebooks: stack.notebooks?.map((nb) =>
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
export const selectStacks = (state) => state.notebooksApp?.notebooks?.stacks || [];
export const selectStandaloneNotebooks = (state) => state.notebooksApp?.notebooks?.standaloneNotebooks || [];
export const selectNotebooksLoading = (state) => state.notebooksApp?.notebooks?.loading || false;
export const selectExpandedStacks = (state) => state.notebooksApp?.notebooks?.expandedStacks || {};
export const selectExpandedNotebooks = (state) => state.notebooksApp?.notebooks?.expandedNotebooks || {};

export default notebooksSlice.reducer;
