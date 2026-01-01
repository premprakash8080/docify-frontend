import { combineReducers } from '@reduxjs/toolkit';
import notes from './notesSlice';
import notebooks from './notebooksSlice';

const reducer = combineReducers({
  notes,
  notebooks,
});

export default reducer;

