import React, { useState, useRef, useLayoutEffect } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';

function ShelfEditor() {
  const [elements, setElements] = useState([]);
  const [resizeLocked, setResizeLocked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(null);
  const zoomInitialized = useRef(false);
  const fitZoomRef = useRef(null);

  const addElement = (type) => {
    const newElement = {
      id: `element_${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width:
        type === 'shelf-line' ? 600 :
        type === 'divider-line' ? 4 :
        120, // Slot
      height:
        type === 'shelf-line' ? 4 :
        type === 'divider-line' ? 300 :
        160, // Slot
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

  const updateSize = (id, width, height) => {
    setElements(prev =>
      prev.map(el => el.id === id ? { ...el, width, height } : el)
    );
  };

  const scrollContainerRef = useRef(null);

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const canvasWidth = 700;
  
    if (scrollEl && !zoomInitialized.current) {
      const containerWidth = scrollEl.clientWidth;
      const fitZoom = Math.min(1, containerWidth / canvasWidth);
      fitZoomRef.current = fitZoom;
      setZoomLevel(fitZoom);
            zoomInitialized.current = true;
  
      // scroll to center
      const scaledWidth = canvasWidth * fitZoom;
      scrollEl.scrollLeft = (scaledWidth - scrollEl.clientWidth) / 2;
    }
  
    if (scrollEl && zoomLevel !== null) {
      const scaledWidth = canvasWidth * zoomLevel;
      scrollEl.scrollLeft = (scaledWidth - scrollEl.clientWidth) / 2;
    }
  }, [zoomLevel]);
  
    return (
    <div className="w-full h-[80vh] relative bg-gray-100 overflow-hidden">

      {/* 🧱 Zoomed + Centered Canvas */}
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-auto pt-4">
      <div style={{ width: `${700 * (zoomLevel || 1)}px`, margin: '0 auto' }}>
      <div
        style={{
          transform: `scale(${zoomLevel || 1})`,
          transformOrigin: 'top center',
          width: '700px',
          height: '525px',
          position: 'relative',
          transition: 'transform 0.2s ease-in-out'
        }}
      >

          {elements.map((el) => (
            <Draggable
              key={el.id}
              scale={zoomLevel || 1}
              defaultPosition={{ x: el.x, y: el.y }}
              onStop={(e, data) => {
                setElements((prev) =>
                  prev.map((item) =>
                    item.id === el.id ? { ...item, x: data.x, y: data.y } : item
                  )
                );
              }}
            >
              <div className="absolute touch-none" style={{ padding: 6 }}>
              <Resizable
                size={{ width: el.width, height: el.height }}
                onResizeStop={(e, direction, ref, delta) => {
                  updateSize(el.id, ref.offsetWidth, ref.offsetHeight);
                }}
                enable={
                  resizeLocked
                    ? {}
                    : {
                        bottomRight: true
                      }
                }
                handleComponent={{
                  bottomRight: !resizeLocked && (
                    <div className="w-6 h-6 bg-yellow-400 absolute bottom-0 right-0 rounded-tr cursor-se-resize z-10" />
                  )
                }}
                minWidth={2}
                minHeight={2}
                className="bg-transparent"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'none',
                  position: 'relative'
                }}
              >
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    el.type === 'shelf-line'
                      ? 'bg-black'
                      : el.type === 'divider-line'
                      ? 'bg-black'
                      : 'bg-gray-300 border border-dashed text-black font-bold'
                  }`}
                  style={
                    el.type === 'slot'
                      ? {
                          fontSize: `${Math.max(Math.min(el.width, el.height) / 4, 12)}px`
                        }
                      : undefined
                  }
                >
                  {el.type === 'slot' && 'Slot'}
                </div>
              </Resizable>
              </div>
            </Draggable>
          ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full z-10 bg-white border-t p-2 flex flex-col items-center gap-2 shadow-md">
  
      {/* Zoom Controls (on top) */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            setZoomLevel(prev => Math.max(fitZoomRef.current || 0.5, (prev || 1) - 0.05))
          }
          className="px-3 py-1 bg-gray-300 rounded text-sm"
        >
          -
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.05))}
          className="px-3 py-1 bg-gray-300 rounded text-sm"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel(fitZoomRef.current)}
          className="px-3 py-1 bg-gray-300 rounded text-sm"
        >
          Reset
        </button>
      </div>

      {/* Main Action Buttons (below zoom) */}
      <div className="flex flex-wrap justify-center gap-2">
        <PaletteButton label="Shelf Line" type="shelf-line" onAdd={addElement} />
        <PaletteButton label="Divider" type="divider-line" onAdd={addElement} />
        <PaletteButton label="Slot" type="slot" onAdd={addElement} />
        <button onClick={saveTemplate} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Save Shelf</button>
        <button onClick={loadTemplate} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Load Shelf</button>
        <button
          onClick={() => setResizeLocked(prev => !prev)}
          className={`px-3 py-1 rounded text-sm ${
            resizeLocked ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
          }`}
        >
          {resizeLocked ? 'Unlock Resize' : 'Lock Resize'}
        </button>
      </div>
    </div>
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
