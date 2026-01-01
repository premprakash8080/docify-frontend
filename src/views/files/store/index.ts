import { combineReducers } from '@reduxjs/toolkit';
import files from './filesSlice';
import selectedFile from './selectedFileSlice';

const reducer = combineReducers({
  files,
  selectedFile,
});

export default reducer;

