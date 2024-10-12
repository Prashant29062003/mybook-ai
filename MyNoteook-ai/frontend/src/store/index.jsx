import { configureStore } from '@reduxjs/toolkit';
import notebookReducer from './notebookSlice';

const store = configureStore({
  reducer: {
    notebook: notebookReducer,
  },
});

export default store;
