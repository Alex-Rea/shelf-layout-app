import React, { useState } from 'react';
import Draggable from 'react-draggable';

function ShelfEditor() {
  const [elements, setElements] = useState([]);

  const addElement = (type) => {
    const newElement = {
      id: `element_${Date.now()}`,
      type,
      x: 50,
      y: 50
    };
    setElements((prev) => [...prev, newElement]);
  };

  return (
    <div className="relative w-full h-[80vh] bg-white border border-dashed overflow-hidden">

      {/* Palette Toolbar */}
      <div className="fixed top-4 left-4 z-10 flex gap-2 bg-white p-2 border rounded shadow">
        <PaletteButton label="Shelf Line" type="shelf-line" onAdd={addElement} />
        <PaletteButton label="Divider" type="divider-line" onAdd={addElement} />
        <PaletteButton label="Slot" type="slot" onAdd={addElement} />
      </div>

      {/* Canvas Elements */}
      {elements.map((el) => (
        <Draggable
          key={el.id}
          defaultPosition={{ x: el.x, y: el.y }}
          onStop={(e, data) => {
            setElements((prev) =>
              prev.map((item) =>
                item.id === el.id ? { ...item, x: data.x, y: data.y } : item
              )
            );
          }}
        >
          <div
            className={`absolute cursor-move ${
              el.type === 'shelf-line'
                ? 'h-[2px] w-[90%] bg-black'
                : el.type === 'divider-line'
                ? 'w-[2px] h-[90%] bg-black'
                : 'w-16 h-20 border border-dashed bg-gray-200'
            }`}
          />
        </Draggable>
      ))}
    </div>
  );
}

function PaletteButton({ type, label, onAdd }) {
  return (
    <button
      onClick={() => onAdd(type)}
      className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
    >
      {label}
    </button>
  );
}

export default ShelfEditor;
