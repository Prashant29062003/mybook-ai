import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCellContent } from '../store/notebookSlice';
import axios from 'axios';
import debounce from 'lodash.debounce';

const CodeCell = ({ id, content }) => {
  const [code, setCode] = useState(content);
  const [executionResult, setExecutionResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Debounced function to handle updates to the Redux store
  const debouncedUpdate = debounce((value) => {
    dispatch(updateCellContent({ id, content: value }));
  }, 300); // Adjust the debounce time as necessary

  const handleChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    debouncedUpdate(newCode);
  };

  const handleRunCode = async () => {
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:8000/api/execute', { code });
      setExecutionResult(response.data.result); // Adjust based on your API response
    } catch (error) {
      console.error('Error executing code:', error);
      setError('Execution failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-4">
      <textarea
        value={code}
        onChange={handleChange}
        className="w-full h-32 p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring focus:border-blue-300"
        placeholder="Write your code here..."
        aria-label="Code input area"
      />
      <button
        onClick={handleRunCode}
        className={`px-4 py-2 text-white rounded transition duration-200 ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        disabled={loading}
        aria-label="Run code"
      >
        {loading ? 'Running...' : 'Run Code'}
      </button>

      {executionResult && (
        <div className="mt-4 p-2 bg-gray-100 border border-gray-300 rounded">
          <p className="font-semibold">Execution Result:</p>
          <pre>{executionResult}</pre>
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-600">{error}</div>
      )}
    </div>
  );
};

export default CodeCell;