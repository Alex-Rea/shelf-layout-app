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
    <div className="flex flex-col md:flex-row h-screen">

      {/* Sidebar: Gallery + Mode Toggle */}
      <div className="order-last md:order-first w-full md:w-1/4 p-2 bg-gray-100 overflow-y-auto">
        <div className="mb-4">
          <button
            className={`px-4 py-2 mr-2 ${mode === 'editor' ? 'bg-blue-600' : 'bg-blue-300'} text-white rounded`}
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
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        {mode === 'editor' ? (
          <ShelfEditor shelves={shelves} setShelves={setShelves} />
        ) : (
          <PlanogramView
            shelves={shelves}
            planogram={planogram}
            setPlanogram={setPlanogram}
            products={products}
          />
        )}
      </div>
    </div>
  );
}

export default App;
