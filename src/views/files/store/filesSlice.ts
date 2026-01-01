import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import fileService from '../services/file.service';
import type { File, FilesResponse, FileResponse, UpdateFileMetadataPayload } from '../types';

// Async thunks
export const fetchFiles = createAsyncThunk<
  FilesResponse,
  void,
  { rejectValue: string }
>('files/fetchFiles', async (_, { rejectWithValue }) => {
  try {
    const response = await fileService.getAllFiles();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to fetch files');
  }
});

export const uploadFile = createAsyncThunk<
  FileResponse,
  FormData,
  { rejectValue: string }
>('files/uploadFile', async (formData, { rejectWithValue }) => {
  try {
    const response = await fileService.uploadFile(formData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to upload file');
  }
});

export const deleteFile = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>('files/deleteFile', async (fileId, { rejectWithValue }) => {
  try {
    await fileService.deleteFile(fileId);
    return fileId;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to delete file');
  }
});

export const updateFileMetadata = createAsyncThunk<
  FileResponse,
  { fileId: number | string; data: UpdateFileMetadataPayload },
  { rejectValue: string }
>('files/updateFileMetadata', async ({ fileId, data }, { rejectWithValue }) => {
  try {
    const response = await fileService.updateFileMetadata(fileId, data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.msg || error.message || 'Failed to update file');
  }
});

// State interface
interface FilesState {
  items: File[];
  loading: boolean;
  error: string | null;
}

const initialState: FilesState = {
  items: [],
  loading: false,
  error: null,
};

// Slice
const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch files
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data && Array.isArray(payload.data)) {
          state.items = payload.data;
        } else if (Array.isArray(payload)) {
          state.items = payload;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch files';
      })
      // Upload file
      .addCase(uploadFile.fulfilled, (state, action) => {
        const newFile = action.payload?.data || action.payload;
        if (newFile) {
          state.items.unshift(newFile as File);
        }
      })
      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.items = state.items.filter((file) => file.id !== action.payload);
      })
      // Update file metadata
      .addCase(updateFileMetadata.fulfilled, (state, action) => {
        const updatedFile = action.payload?.data || action.payload;
        if (updatedFile) {
          const index = state.items.findIndex((file) => file.id === (updatedFile as File).id);
          if (index !== -1) {
            state.items[index] = updatedFile as File;
          }
        }
      });
  },
});

// Selectors
export const selectFiles = (state: { filesApp?: { files?: FilesState } }): File[] => {
  return state.filesApp?.files?.items || [];
};

export const selectFilesLoading = (state: { filesApp?: { files?: FilesState } }): boolean => {
  return state.filesApp?.files?.loading || false;
};

export const selectFileById = (state: { filesApp?: { files?: FilesState } }, fileId: number | string): File | undefined => {
  return state.filesApp?.files?.items?.find((file) => file.id === fileId);
};

export default filesSlice.reducer;

