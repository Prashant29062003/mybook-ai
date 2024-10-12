import React from 'react';
import Notebook from './components/Notebook';
import './index.css';

function App() {
  return (
    <div className="App min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        AI Notebook
      </h1>
      <Notebook />
    </div>
  );
}

export default App;
