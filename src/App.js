import React, { useState } from 'react';
import ShelfEditor from './components/ShelfEditor';
import PlanogramView from './components/PlanogramView';

function App() {
  const [mode, setMode] = useState('editor'); // 'editor' or 'planogram'

  // Each shelf contains a list of slots
  const [shelves, setShelves] = useState([]);

  // Slot ID → product ID mapping
  const [planogram, setPlanogram] = useState({});

  // Example product list (replace with JSON later)
  const products = [
    { id: 'lays-classic', name: 'Lays Classic', image: '/images/products/00028400090858_C1C1_s01.jpg' },
    { id: 'doritos-cool-ranch', name: 'Doritos', image: '/images/products/doritos-cool-ranch.webp' },
    { id: 'mms', name: 'M&Ms', image: '/images/products/mms.webp' }
  ];

  return (
    <div className="flex flex-col h-screen">

      {/* 🔝 Mode Switch Bar at the Top */}
      <div className="w-full bg-gray-100 p-2 border-b flex justify-center gap-4">
        <button
          className={`px-4 py-2 ${mode === 'editor' ? 'bg-blue-600' : 'bg-blue-300'} text-white rounded`}
          onClick={() => setMode('editor')}
        >
          Shelf Editor
        </button>
        <button
          className={`px-4 py-2 ${mode === 'planogram' ? 'bg-green-600' : 'bg-green-300'} text-white rounded`}
          onClick={() => setMode('planogram')}
        >
          Planogram Mode
        </button>
      </div>

      {/* 🧱 Main Layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* Removed Sidebar content — now handled inside each mode */}

        {/* Main Working Area */}
        <div className="flex-1 p-4 bg-white overflow-y-auto">
          {mode === 'editor' ? (
            <ShelfEditor shelves={shelves} setShelves={setShelves} />
          ) : (
            <PlanogramView
              shelves={shelves}
              setShelves={setShelves}
              planogram={planogram}
              setPlanogram={setPlanogram}
              products={products}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
