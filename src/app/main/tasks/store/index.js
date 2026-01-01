import { combineReducers } from '@reduxjs/toolkit';
import tasks from './tasksSlice';

const reducer = combineReducers({
  tasks,
});

export default reducer;

