import { combineReducers } from '@reduxjs/toolkit';
import templates from './templatesSlice';

const reducer = combineReducers({
  templates,
});

export default reducer;

