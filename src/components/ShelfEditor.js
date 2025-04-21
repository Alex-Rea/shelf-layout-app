import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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

  const saveTemplate = () => {
    const name = prompt("Enter template name:");
    if (!name) return;

    const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
    templates[name] = elements;
    localStorage.setItem('shelfTemplates', JSON.stringify(templates));
    alert(`Shelf template "${name}" saved!`);
  };

  const loadTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
    const name = prompt("Enter template name to load:", Object.keys(templates)[0] || '');
    if (!templates[name]) return alert("Template not found.");

    setElements(templates[name]);
  };

  return (
    <div className="relative w-full h-[80vh] bg-white border border-dashed overflow-hidden">

      {/* 🧰 Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 w-full z-10 bg-white border-t p-2 flex justify-center gap-2 shadow-md">
        <PaletteButton label="Shelf Line" type="shelf-line" onAdd={addElement} />
        <PaletteButton label="Divider" type="divider-line" onAdd={addElement} />
        <PaletteButton label="Slot" type="slot" onAdd={addElement} />
        <button onClick={saveTemplate} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Save Shelf</button>
        <button onClick={loadTemplate} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Load Shelf</button>
      </div>

      {/* 🧱 Zoomable Canvas with Draggables */}
      <TransformWrapper
        minScale={0.5}
        maxScale={3}
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.05 }}
      >
        <TransformComponent>
          <div className="relative w-full h-[80vh]">
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
        </TransformComponent>
      </TransformWrapper>
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
