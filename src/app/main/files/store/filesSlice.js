import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import fileService from '../services/file.service';

export const fetchFiles = createAsyncThunk('filesApp/files/fetchFiles', async (_, { rejectWithValue }) => {
  try {
    const response = await fileService.getAllFiles();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to fetch files');
  }
});

export const uploadFile = createAsyncThunk('filesApp/files/uploadFile', async (formData, { rejectWithValue }) => {
  try {
    const response = await fileService.uploadFile(formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to upload file');
  }
});

export const deleteFile = createAsyncThunk('filesApp/files/deleteFile', async (fileId, { rejectWithValue }) => {
  try {
    await fileService.deleteFile(fileId);
    return fileId;
  } catch (error) {
    return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to delete file');
  }
});

export const updateFileMetadata = createAsyncThunk(
  'filesApp/files/updateFileMetadata',
  async ({ fileId, data }, { rejectWithValue }) => {
    try {
      const response = await fileService.updateFileMetadata(fileId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to update file');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const filesSlice = createSlice({
  name: 'filesApp/files',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response format: { success: true, data: [...] } or just [...]
        const { payload } = action;
        if (payload?.success && payload?.data) {
          state.items = Array.isArray(payload.data) ? payload.data : [];
        } else if (Array.isArray(payload)) {
          state.items = payload;
        } else if (payload?.data && Array.isArray(payload.data)) {
          state.items = payload.data;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        const newFile = action.payload?.data || action.payload;
        if (newFile) {
          state.items.unshift(newFile);
        }
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter((file) => file.id !== action.payload);
      })
      .addCase(updateFileMetadata.fulfilled, (state, action) => {
        const updatedFile = action.payload?.data || action.payload;
        if (updatedFile) {
          const index = state.items.findIndex((file) => file.id === updatedFile.id);
          if (index !== -1) {
            state.items[index] = updatedFile;
          }
        }
      });
  },
});

export const selectFiles = (state) => state.filesApp?.files?.items || [];
export const selectFilesLoading = (state) => state.filesApp?.files?.loading || false;
export const selectFileById = (state, fileId) => state.filesApp?.files?.items?.find((file) => file.id === fileId);

export default filesSlice.reducer;

