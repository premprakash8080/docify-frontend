import { combineReducers } from '@reduxjs/toolkit';
import tags from './tagsSlice';

const reducer = combineReducers({
  tags,
});

export default reducer;

