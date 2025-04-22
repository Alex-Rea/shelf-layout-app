import React, { useState, useRef, useLayoutEffect } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';

function ShelfEditor() {
  const [elements, setElements] = useState([]);
  const [resizeLocked, setResizeLocked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(null);
  const zoomInitialized = useRef(false);
  const fitZoomRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const canvasRef = useRef(null);

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
  
  const getDragBounds = (el) => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
  
    return {
      left: 0,
      top: 0,
      right: canvas.offsetWidth - el.width,
      bottom: canvas.offsetHeight - el.height
    };
  };
  
          

  const saveTemplate = () => {
    let name = selectedTemplate || prompt("Enter template name:");
    if (!name) return;
  
    const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
    templates[name] = elements;
    localStorage.setItem('shelfTemplates', JSON.stringify(templates));
    setSelectedTemplate(name);
    alert(`Shelf template "${name}" saved!`);
  };
  
  const updateSize = (id, width, height) => {
    setElements(prev =>
      prev.map(el => el.id === id ? { ...el, width, height } : el)
    );
  };

  const scrollContainerRef = useRef(null);

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const canvasEl = canvasRef.current;
  
    if (scrollEl && canvasEl && !zoomInitialized.current) {
      const containerWidth = scrollEl.clientWidth;
      const fitZoom = Math.max(0.50, Math.min(1, containerWidth / canvasEl.offsetWidth));
      fitZoomRef.current = fitZoom;
      setZoomLevel(fitZoom);
      zoomInitialized.current = true;
    }
  
    if (scrollEl && canvasEl && zoomLevel !== null) {
      // Wait for transform to apply
      requestAnimationFrame(() => {
        const scaledWidth = canvasEl.offsetWidth * zoomLevel;
        const scrollX = (scaledWidth - scrollEl.clientWidth) / 2;
        scrollEl.scrollLeft = scrollX > 0 ? scrollX : 0;
      });
    }
  }, [zoomLevel]);
        
    return (
    <div className="w-full h-[80vh] relative bg-gray-100 overflow-hidden">

      {/* 🧱 Zoomed + Centered Canvas */}
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-auto pt-4">
          <div
      ref={canvasRef}
      style={{
        transform: `scale(${zoomLevel || 1})`,
        transformOrigin: 'top center',
        width: '1000px',
        height: '1000px',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out',
        border: '2px dashed #ccc', // 👈 soft edge border
        borderRadius: '8px',        // optional: soft corners
        boxSizing: 'border-box',    // ensures border doesn't alter size
        backgroundColor: '#fdfdfd'  // optional: slight contrast to outer area
      }}
    >

          {elements.map((el) => (
            <Draggable
              key={el.id}
              scale={zoomLevel || 1}
              defaultPosition={{ x: el.x, y: el.y }}
              bounds={getDragBounds(el)}
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

      <div className="fixed bottom-0 left-0 w-full z-10 bg-white border-t p-2 flex flex-col items-center gap-2 shadow-md">
  
      {/* Zoom Controls (on top) */}
      <div className="flex gap-2">
      <button
          onClick={() =>
            setZoomLevel(prev => Math.max(0.2, (prev || 1) - 0.05)) // 👈 allows zooming out down to 0.2
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
      <div className="flex flex-wrap justify-center gap-2 items-center">
        <PaletteButton label="Shelf Line" type="shelf-line" onAdd={addElement} />
        <PaletteButton label="Divider" type="divider-line" onAdd={addElement} />
        <PaletteButton label="Slot" type="slot" onAdd={addElement} />
        <button onClick={saveTemplate} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Save Shelf</button>
        
        <select
          className="px-3 py-1 border rounded text-sm"
          value={selectedTemplate}
          onChange={(e) => {
            const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
            const name = e.target.value;
            setSelectedTemplate(name);
            if (templates[name]) {
              setElements(templates[name]);
            } else {
              alert('Template not found.');
            }
          }}
        >
          <option value="">Load Shelf...</option>
          {Object.keys(JSON.parse(localStorage.getItem('shelfTemplates') || '{}')).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <button
          onClick={() => setResizeLocked(prev => !prev)}
          className={`px-3 py-1 rounded text-sm ${
            resizeLocked ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'
          }`}
        >
          {resizeLocked ? 'Unlock Resize' : 'Lock Resize'}
        </button>

        <button
          onClick={() => {
            setElements([]);
            setSelectedTemplate('');
          }}
          className="px-3 py-1 bg-red-400 text-white rounded text-sm"
        >
          Clear
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
