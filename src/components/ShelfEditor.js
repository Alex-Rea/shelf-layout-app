import React, { useState } from 'react';

function ShelfEditor({ shelves, setShelves }) {
  const [elements, setElements] = useState([]);

  const handleDrop = (e) => {
    const type = e.dataTransfer.getData("type");
    const x = e.clientX;
    const y = e.clientY;

    const newElement = {
      id: `element_${Date.now()}`,
      type,
      x,
      y
    };

    setElements((prev) => [...prev, newElement]);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <div className="border border-dashed h-[80vh] w-full bg-white relative overflow-hidden" onDrop={handleDrop} onDragOver={allowDrop}>
      {/* Palette */}
      <div className="mb-4 flex gap-4">
        <DraggableItem type="shelf-line" label="Shelf Line" />
        <DraggableItem type="divider-line" label="Divider" />
        <DraggableItem type="slot" label="Slot" />
      </div>

      {/* Canvas elements */}
      {elements.map((el) => (
        <div
          key={el.id}
          className={`absolute ${el.type === "shelf-line" ? "h-[2px] w-full bg-black" :
            el.type === "divider-line" ? "w-[2px] h-full bg-black" :
              "w-16 h-20 border border-dashed bg-gray-200"} `}
          style={{ left: el.x, top: el.y }}
        />
      ))}
    </div>
  );
}

function DraggableItem({ type, label }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("type", type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="px-3 py-1 bg-gray-300 rounded cursor-move"
    >
      {label}
    </div>
  );
}

export default ShelfEditor;
