import { combineReducers } from '@reduxjs/toolkit';
import notebooks from './notebooksSlice';

const notebooksReducer = combineReducers({
  notebooks,
});

export default notebooksReducer;

