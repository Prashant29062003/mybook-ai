import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCodeCell, addAIPromptCell } from '../store/notebookSlice';
import CodeCell from './CodeCell';
import AIPromptCell from './AIPromptCell';

const Notebook = () => {
  const cells = useSelector((state) => state.notebook.cells);
  const dispatch = useDispatch();

  const handleAddCodeCell = () => {
    try {
      dispatch(addCodeCell(''));
    } catch (error) {
      console.error('Failed to add code cell:', error);
      // Optionally, set an error state to display feedback to the user
    }
  };

  const handleAddAIPromptCell = () => {
    try {
      dispatch(addAIPromptCell(''));
    } catch (error) {
      console.error('Failed to add AI prompt cell:', error);
      // Optionally, set an error state to display feedback to the user
    }
  };

  const renderCell = (cell) => {
    if (cell.type === 'code') {
      return <CodeCell key={cell.id} id={cell.id} content={cell.content} />;
    } else if (cell.type === 'ai-prompt') {
      return <AIPromptCell key={cell.id} id={cell.id} content={cell.content} />;
    }
    return null; // safety net
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Notebook</h1>
        <div className="space-x-2">
          <button
            onClick={handleAddCodeCell}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition duration-200"
            aria-label="Add Code Cell"
          >
            Add Code Cell
          </button>
          <button
            onClick={handleAddAIPromptCell}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition duration-200"
            aria-label="Add AI Prompt Cell"
          >
            Add AI Prompt Cell
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {cells.map(renderCell)}
      </div>
    </div>
  );
};

export default Notebook;