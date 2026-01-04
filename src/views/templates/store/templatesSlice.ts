import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import templateService from '../services/template.service';
import type { Template } from '../types';

interface TemplatesState {
  systemTemplates: Template[];
  myTemplates: Template[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  systemTemplates: [],
  myTemplates: [],
  loading: false,
  error: null,
};

export const fetchSystemTemplates = createAsyncThunk(
  'templates/fetchSystemTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await templateService.getSystemTemplates();
      return response.data.templates;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to fetch system templates');
    }
  }
);

export const fetchMyTemplates = createAsyncThunk(
  'templates/fetchMyTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await templateService.getMyTemplates();
      return response.data.templates;
    } catch (error: any) {
      return rejectWithValue(error.msg || error.message || 'Failed to fetch user templates');
    }
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemTemplates.fulfilled, (state, action: PayloadAction<Template[]>) => {
        state.loading = false;
        state.systemTemplates = action.payload;
      })
      .addCase(fetchSystemTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTemplates.fulfilled, (state, action: PayloadAction<Template[]>) => {
        state.loading = false;
        state.myTemplates = action.payload;
      })
      .addCase(fetchMyTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = templatesSlice.actions;

export const selectSystemTemplates = (state: any): Template[] =>
  state.templatesApp?.templates?.systemTemplates || [];
export const selectMyTemplates = (state: any): Template[] =>
  state.templatesApp?.templates?.myTemplates || [];
export const selectTemplatesLoading = (state: any): boolean =>
  state.templatesApp?.templates?.loading || false;
export const selectTemplatesError = (state: any): string | null =>
  state.templatesApp?.templates?.error || null;

export default templatesSlice.reducer;

