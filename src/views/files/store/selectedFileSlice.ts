import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SelectedFileState {
  selectedFileId: number | string | null;
}

const initialState: SelectedFileState = {
  selectedFileId: null,
};

const selectedFileSlice = createSlice({
  name: 'selectedFile',
  initialState,
  reducers: {
    setSelectedFile: (state, action: PayloadAction<number | string>) => {
      state.selectedFileId = action.payload;
    },
    clearSelectedFile: (state) => {
      state.selectedFileId = null;
    },
  },
});

export const { setSelectedFile, clearSelectedFile } = selectedFileSlice.actions;

export const selectSelectedFileId = (state: { filesApp?: { selectedFile?: SelectedFileState } }): number | string | null => {
  return state.filesApp?.selectedFile?.selectedFileId || null;
};

export default selectedFileSlice.reducer;

