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
        if (payload?.data?.files && Array.isArray(payload.data.files)) {
          state.items = payload.data.files;
        } else if (payload?.data && Array.isArray(payload.data)) {
          state.items = payload.data;
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
        const payload = action.payload;
        const newFile = payload?.data?.file || payload?.data || payload;
        if (newFile && typeof newFile === 'object' && 'id' in newFile) {
          state.items.unshift(newFile as File);
        }
      })
      // Delete file
      .addCase(deleteFile.fulfilled, (state, action) => {
        const fileId = action.payload;
        state.items = state.items.filter((file) => String(file.id) !== String(fileId));
      })
      // Update file metadata
      .addCase(updateFileMetadata.fulfilled, (state, action) => {
        const payload = action.payload;
        const updatedFile = payload?.data?.file || payload?.data || payload;
        if (updatedFile && typeof updatedFile === 'object' && 'id' in updatedFile) {
          const index = state.items.findIndex((file) => String(file.id) === String((updatedFile as File).id));
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

export const selectFilesError = (state: { filesApp?: { files?: FilesState } }): string | null => {
  return state.filesApp?.files?.error || null;
};

export const selectFileById = (state: { filesApp?: { files?: FilesState } }, fileId: string | number): File | undefined => {
  const items = state.filesApp?.files?.items || [];
  return items.find((file) => String(file.id) === String(fileId));
};

export default filesSlice.reducer;

