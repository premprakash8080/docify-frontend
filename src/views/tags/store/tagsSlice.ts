import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import tagService from '../services/tag.service';
import type { Tag, CreateTagPayload, UpdateTagPayload } from '../types';

interface TagsState {
  items: Tag[];
  loading: boolean;
  error: string | null;
  count: number;
}

const initialState: TagsState = {
  items: [],
  loading: false,
  error: null,
  count: 0,
};

// Async thunks
export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tagService.getAllTags();
      return response.data.tags;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to fetch tags');
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (payload: CreateTagPayload, { rejectWithValue, dispatch }) => {
    try {
      const response = await tagService.createTag(payload);
      // Refresh tags after creation
      dispatch(fetchTags());
      return response.data.tag;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to create tag');
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ tagId, payload }: { tagId: number; payload: UpdateTagPayload }, { rejectWithValue, dispatch }) => {
    try {
      const response = await tagService.updateTag(tagId, payload);
      // Refresh tags after update
      dispatch(fetchTags());
      return response.data.tag;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to update tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (tagId: number, { rejectWithValue, dispatch }) => {
    try {
      await tagService.deleteTag(tagId);
      // Refresh tags after deletion
      dispatch(fetchTags());
      return tagId;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to delete tag');
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.loading = false;
        state.items = action.payload;
        state.count = action.payload.length;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create tag
      .addCase(createTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTag.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update tag
      .addCase(updateTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete tag
      .addCase(deleteTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = tagsSlice.actions;

// Selectors
export const selectTagsItems = (state: any) => state.tagsApp?.tags?.items || [];
export const selectTagsLoading = (state: any) => state.tagsApp?.tags?.loading || false;
export const selectTagsError = (state: any) => state.tagsApp?.tags?.error || null;
export const selectTagsCount = (state: any) => state.tagsApp?.tags?.count || 0;

export default tagsSlice.reducer;

