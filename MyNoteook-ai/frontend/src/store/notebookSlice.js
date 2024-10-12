import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  cells: [], // Stores the notebook cells (code and AI prompt cells)
  loading: { create: false, ai: false, code: false }, // Separate loading states for different operations
  error: null, // Error message for request-related issues
};

const notebookSlice = createSlice({
  name: 'notebook',
  initialState,
  reducers: {
    addCodeCell: (state, action) => {
      state.cells.push({ id: Date.now(), type: 'code', content: action.payload });
    },
    addAIPromptCell: (state, action) => {
      state.cells.push({ id: Date.now(), type: 'ai', content: action.payload });
    },
    updateCellContent: (state, action) => {
      const cell = state.cells.find(cell => cell.id === action.payload.id);
      if (cell) {
        cell.content = action.payload.content;
      }
    },
    setAIResponse: (state, action) => {
      const cell = state.cells.find(cell => cell.id === action.payload.id);
      if (cell && cell.type === 'ai') {
        cell.response = action.payload.response;
      }
    },
    setCodeExecutionOutput: (state, action) => {
      const cell = state.cells.find(cell => cell.id === action.payload.id);
      if (cell && cell.type === 'code') {
        cell.output = action.payload.output;
      }
    },
    setLoading: (state, action) => {
      state.loading[action.payload.operation] = action.payload.value; // Support for multiple loading states
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearAllCells: (state) => {
      state.cells = [];
    },
  },
});

export const {
  addCodeCell,
  addAIPromptCell,
  updateCellContent,
  setAIResponse,
  setCodeExecutionOutput,
  setLoading,
  setError,
  clearError,
  clearAllCells,
} = notebookSlice.actions;

// Fetch AI Response
export const fetchAIResponse = (id, prompt) => async dispatch => {
  dispatch(setLoading({ operation: 'ai', value: true }));
  dispatch(clearError());
  try {
    const response = await axios.post('http://localhost:8000/api/ai', { prompt });
    dispatch(setAIResponse({ id, response: response.data.response }));
    return response.data; // Return the response for further handling if needed
  } catch (error) {
    console.error("Error fetching AI response:", error);
    dispatch(setError("Failed to fetch AI response."));
    return null; // Return null or an error object for handling
  } finally {
    dispatch(setLoading({ operation: 'ai', value: false }));
  }
};

// Execute Code
export const executeCode = (id, code) => async dispatch => {
  dispatch(setLoading({ operation: 'code', value: true }));
  dispatch(clearError());
  try {
    const response = await axios.post('http://localhost:8000/api/run-code', { code });
    dispatch(setCodeExecutionOutput({ id, output: response.data.output }));
    return response.data; // Return the output for further handling if needed
  } catch (error) {
    console.error("Error executing code:", error);
    dispatch(setError("Failed to execute code."));
    return null; // Return null or an error object for handling
  } finally {
    dispatch(setLoading({ operation: 'code', value: false }));
  }
};

export default notebookSlice.reducer;