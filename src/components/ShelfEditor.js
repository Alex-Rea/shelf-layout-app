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

  const scrollContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);


  const addElement = (type) => {
    const timestamp = Date.now();
    const newElement = {
      id: `element_${timestamp}`,
      type,
      x: 50,
      y: 50,
      width: type === 'shelf-line' ? 600 : type === 'divider-line' ? 4 : 120,
      height: type === 'shelf-line' ? 4 : type === 'divider-line' ? 300 : 160,
      ...(type === 'slot' && { slotId: `slot_${timestamp}`, product: null })
    };
    setElements(prev => [...prev, newElement]);
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
    const name = selectedTemplate || prompt("Enter template name:");
    if (!name) return;
    const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
    templates[name] = elements;
    localStorage.setItem('shelfTemplates', JSON.stringify(templates));
    setSelectedTemplate(name);
    alert(`Shelf template "${name}" saved!`);
  };

  const updateSize = (id, width, height) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, width, height } : el));
  };

  

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current;
    const canvasEl = canvasRef.current;

    if (scrollEl && canvasEl && !zoomInitialized.current) {
      const containerWidth = scrollEl.clientWidth;
      const fitZoom = Math.max(0.4, Math.min(1, containerWidth / canvasEl.offsetWidth));
      fitZoomRef.current = fitZoom;
      setZoomLevel(fitZoom);
      zoomInitialized.current = true;
    }
  }, [zoomLevel]);

  return (
    <div className="w-full h-[80vh] flex flex-col bg-gray-100 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="min-w-max min-h-max flex items-center justify-center">
          <div ref={scrollContainerRef} className="relative inline-block">
            <div
              ref={canvasRef}
              style={{
                transform: `scale(${zoomLevel || 1})`,
                transformOrigin: 'center center',
                width: '1000px',
                height: '1000px',
                transition: 'transform 0.2s ease-in-out',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                backgroundColor: '#fdfdfd',
                position: 'relative',
                flexShrink: 0
              }}
            >
              {elements.map((el) => (
                <Draggable
                  key={el.id}
                  scale={zoomLevel || 1}
                  defaultPosition={{ x: el.x, y: el.y }}
                  bounds={getDragBounds(el)}
                  onStart={(e) => {
                    // Prevent dragging when the resize handle is the event target
                    if (e.target.classList.contains('resize-handle')) {
                      return false; // cancel drag
                    }
                  }}
                  onStop={(e, data) => {
                    setElements(prev => prev.map(item =>
                      item.id === el.id ? { ...item, x: data.x, y: data.y } : item
                    ));
                  }}
                >
                  <div className="absolute touch-none" style={{ padding: 6 }}>
                  <Resizable
                      size={{ width: el.width, height: el.height }}
                      onResizeStart={() => setIsResizing(true)}
                      onResizeStop={(e, direction, ref) => {
                        updateSize(el.id, ref.offsetWidth, ref.offsetHeight);
                        setIsResizing(false);
                      }}                      
                      enable={resizeLocked ? {} : { bottomRight: true }}
                      handleComponent={{
                        bottomRight: !resizeLocked && (
                          <div
                            className="resize-handle w-6 h-6 bg-yellow-400 absolute bottom-0 right-0 rounded-tr cursor-se-resize z-10"
                          />
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
                          el.type === 'shelf-line' || el.type === 'divider-line'
                            ? 'bg-black'
                            : 'bg-gray-300 border border-dashed text-black font-bold'
                        }`}
                        style={el.type === 'slot'
                          ? { fontSize: `${Math.max(Math.min(el.width, el.height) / 4, 12)}px` }
                          : undefined}
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
      </div>

      <div className="fixed bottom-0 left-0 w-full z-10 bg-white border-t p-2 flex flex-col items-center gap-2 shadow-md">
        <div className="flex gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.2, (prev || 1) - 0.1))}
            className="px-3 py-1 bg-gray-300 rounded text-sm"
          >
            -
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.min(2, (prev || 1) + 0.1))}
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

        <div className="flex flex-wrap justify-center gap-2 items-center">
          <PaletteButton label="Shelf Line" type="shelf-line" onAdd={addElement} />
          <PaletteButton label="Divider" type="divider-line" onAdd={addElement} />
          <PaletteButton label="Slot" type="slot" onAdd={addElement} />
          <button onClick={saveTemplate} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
            Save Shelf
          </button>

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
