import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedFileId: null,
};

const selectedFileSlice = createSlice({
  name: 'filesApp/selectedFile',
  initialState,
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFileId = action.payload;
    },
    clearSelectedFile: (state) => {
      state.selectedFileId = null;
    },
  },
});

export const { setSelectedFile, clearSelectedFile } = selectedFileSlice.actions;
export const selectSelectedFileId = (state) => state.filesApp?.selectedFile?.selectedFileId;

export default selectedFileSlice.reducer;

