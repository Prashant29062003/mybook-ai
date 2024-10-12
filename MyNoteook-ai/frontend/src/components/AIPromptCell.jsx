import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateCellContent } from '../store/notebookSlice';
import debounce from 'lodash.debounce';

const AIPromptCell = ({ id, content }) => {
  const [prompt, setPrompt] = useState(content);
  const [aiResponse, setAIResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Update redux state on prompt change with debouncing
  const debouncedUpdate = debounce((value) => {
    dispatch(updateCellContent({ id, content: value }));
  }, 300); // 300ms debounce time

  const handleChange = (e) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    debouncedUpdate(newPrompt);
  };

  const handleGetAIResponse = async () => {
    setLoading(true);
    setError(''); // Reset error prior to the API call

    try {
      const response = await axios.post('http://localhost:8000/api/ai', { prompt });
      setAIResponse(response.data.response);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setError('Failed to fetch AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPrompt(content); // Update local state when content prop changes
  }, [content]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-4">
      <label htmlFor={`ai-prompt-${id}`} className="block text-sm font-medium text-gray-700">
        Enter your AI prompt:
      </label>
      <textarea
        id={`ai-prompt-${id}`}
        value={prompt}
        onChange={handleChange}
        className="w-full h-24 p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring focus:border-blue-300"
        placeholder="Enter your AI prompt here..."
      />
      <button
        onClick={handleGetAIResponse}
        className={`px-4 py-2 text-white rounded transition duration-200 ${
          loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Get AI Response'}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600">{error}</div>
      )}

      {aiResponse && (
        <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded">
          <p className="font-semibold">AI Response:</p>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default AIPromptCell;