import React, { useState, useRef, useLayoutEffect } from 'react';
import { DragDropContext, Droppable, Draggable as DNDDraggable } from 'react-beautiful-dnd';
import RDraggable from 'react-draggable';


function PlanogramView({ shelves, setShelves, planogram, setPlanogram, products }) {
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [galleryCollapsed, setGalleryCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(null);
  const [slotDragMode, setSlotDragMode] = useState(false);
  const zoomInitialized = useRef(false);
  const fitZoomRef = useRef(null);

  const scrollContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    // update product assignment
    setPlanogram(prev => ({
      ...prev,
      [destination.droppableId]: draggableId
    }));
  };

  const savePlanogram = () => {
    const name = prompt("Enter planogram name:");
    if (!name) return;

    const templates = JSON.parse(localStorage.getItem('planogramTemplates') || '{}');
    templates[name] = planogram;
    localStorage.setItem('planogramTemplates', JSON.stringify(templates));
    alert(`Planogram "${name}" saved!`);
  };

  const loadPlanogram = () => {
    const templates = JSON.parse(localStorage.getItem('planogramTemplates') || '{}');
    const name = prompt("Enter planogram name to load:", Object.keys(templates)[0] || '');
    if (!templates[name]) return alert("Template not found.");
    setPlanogram(templates[name]);
  };

  const clearCanvas = () => {
    const confirmClear = window.confirm("Are you sure you want to clear the entire canvas?");
    if (!confirmClear) return;
  
    setShelves([]);
    setPlanogram({});
    setSlotDragMode(false); // Optional: Reset drag mode too
  };
  
  const handleCenterOnDesign = () => {
    const scrollEl = scrollContainerRef.current;
    const canvasEl = canvasRef.current;
  
    if (!scrollEl || !canvasEl) return;
  
    const canvasWidth = canvasEl.offsetWidth;
    const canvasHeight = canvasEl.offsetHeight;
  
    const containerWidth = scrollEl.clientWidth;
    const containerHeight = scrollEl.clientHeight;
  
    // ✅ Zoom out view to expose canvas
    const zoomOut = 0.4; // You can adjust this factor
    setZoomLevel(zoomOut);
  
    // ✅ Delay until zoom has applied
    setTimeout(() => {
      // Calculate scroll positions based on unscaled canvas
      const scrollLeft = ((canvasWidth * zoomOut - containerWidth) / 2) + 1000;
      const scrollTop = ((canvasHeight * zoomOut - containerHeight) / 2) + 1000;
        
      scrollEl.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'smooth',
      });
    }, 100);
  };
      
      

  const handleAddShelfFromTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
    const name = prompt("Enter shelf template name to load:", Object.keys(templates)[0] || '');
    const elements = templates[name];
    if (!elements) return alert("Template not found.");

    const newShelfId = `shelf_${shelves.length + 1}`;
    const mappedElements = elements.map((el, idx) => ({
      ...el,
      id: `${newShelfId}_${el.type}_${idx + 1}`,
      shelfId: newShelfId
    }));

    const slotIds = mappedElements
      .filter(el => el.type === 'slot')
      .map(el => ({ id: el.id }));

    const newShelf = {
      id: newShelfId,
      elements: mappedElements,
      slots: slotIds
    };

    setShelves(prev => [...prev, newShelf]);
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full h-full flex flex-col bg-white overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="min-w-max min-h-max flex items-center justify-center">
          <div
  ref={scrollContainerRef}
  className="relative w-full h-full overflow-auto"
  style={{ touchAction: 'manipulation' }}
>
  <div
    style={{
      width: `${1250 * (zoomLevel || 1)}px`,
      height: `${1250 * (zoomLevel || 1)}px`,
      transition: 'width 0.2s ease, height 0.2s ease',
    }}
  >
    <div
      ref={canvasRef}
      style={{
        width: '1250px',
        height: '1250px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        backgroundColor: '#fdfdfd',
        position: 'relative',
        transform: `scale(${zoomLevel || 1})`,
        transformOrigin: 'top left',
      }}
    >

{shelves.map((shelf) => (
  <div key={shelf.id} className="absolute" style={{ top: 0, left: 0 }}>
    {shelf.elements.map(el => {
      if (el.type === 'shelf-line' || el.type === 'divider-line') {
        return (
          <div
            key={el.id}
            className="absolute bg-black"
            style={{
              width: `${el.width}px`,
              height: `${el.height}px`,
              left: `${el.x}px`,
              top: `${el.y}px`,
            }}
          />
        );
      }

      if (el.type === 'slot') {
        const productId = planogram[el.id];
        const product = products.find(p => p.id === productId);

        
        
        return slotDragMode ? (
          <RDraggable
            key={el.id}
            position={{ x: el.x, y: el.y }}
            onDrag={(e, data) => {
              const speed = 1.25; // speed multiplier
            
              const adjustedX = el.x + (data.deltaX * speed);
              const adjustedY = el.y + (data.deltaY * speed);
            
              setShelves(prev =>
                prev.map(s =>
                  s.id !== shelf.id
                    ? s
                    : {
                        ...s,
                        elements: s.elements.map(item =>
                          item.id === el.id
                            ? { ...item, x: adjustedX, y: adjustedY }
                            : item
                        )
                      }
                )
              );
            }}
                      >
            <div
            style={{
              position: 'absolute',
              width: el.width,
              height: el.height,
              zIndex: 10,
              transition: 'transform 0.1s ease-out'  // 👈 This line!
            }}
              className="border border-dashed bg-white flex items-center justify-center cursor-move"
              onClick={() => setActiveSlotId(el.id)}
            >
              <Droppable droppableId={el.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {product ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Empty</span>
                    )}
                    {provided.placeholder}
                  </div>
                  
                )}
              </Droppable>
            </div>
          </RDraggable>
                        ) : (
                          <div
                            key={el.id}
                            style={{
                              position: 'absolute',
                              left: el.x,
                              top: el.y,
                              width: el.width,
                              height: el.height,
                              zIndex: 10
                            }}
                            className="border border-dashed bg-white flex items-center justify-center cursor-pointer"
                            onClick={() => setActiveSlotId(el.id)}
                          >
                            <Droppable droppableId={el.id}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="w-full h-full flex items-center justify-center"
                                >
                                  {product ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">Empty</span>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        );
                        }
                      return null;
                    })}
                  </div>
                ))}           
              </div>
            </div>
          </div>
          </div>

        </div>

        {/* Bottom Toolbar */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-10 px-4 pt-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold">Product Gallery</h4>
            <button
              className="text-xs text-blue-600 underline"
              onClick={() => setGalleryCollapsed(prev => !prev)}
            >
              {galleryCollapsed ? "Show Gallery" : "Hide Gallery"}
            </button>
          </div>

          {!galleryCollapsed && (
            <>
              {showSearch && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  placeholder="Search products..."
                />
              )}
              <button
                onClick={() => setShowSearch(prev => !prev)}
                className="text-xs text-gray-600 underline mb-2"
              >
                {showSearch ? "Hide Filter" : "Filter"}
              </button>

              <Droppable droppableId="product-gallery" direction="horizontal" isDropDisabled>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-wrap gap-2 overflow-x-auto pb-3"
                  >
                    {filteredProducts.map((product, index) => (
                      <DNDDraggable key={product.id} draggableId={product.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            className="w-16 h-20 border bg-white p-1"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </DNDDraggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </>
          )}

          {/* Zoom Controls */}
          <div className="flex justify-center gap-2 mb-2">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.2, (prev || 1) - 0.15))}
              className="px-3 py-1 bg-gray-300 rounded text-sm"
            >
              -
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2, (prev || 1) + 0.15))}
              className="px-3 py-1 bg-gray-300 rounded text-sm"
            >
              +
            </button>
            <button
              onClick={handleCenterOnDesign}
              className="px-3 py-1 bg-purple-400 text-white rounded text-sm"
            >
              Center on Design
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 border-t pt-3 mt-2">
          <button
  onClick={clearCanvas}
  className="px-3 py-2 bg-red-500 text-white rounded text-sm"
>
  Clear Canvas
</button>
          <button
              onClick={() => shelves.length > 0 && setSlotDragMode(prev => !prev)}
              disabled={shelves.length === 0}
              className={`px-3 py-2 rounded text-sm transition-all ${
                shelves.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : slotDragMode
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {slotDragMode ? 'Disable Slot Drag' : 'Enable Slot Drag'}
            </button>
            <button onClick={handleAddShelfFromTemplate} className="px-3 py-2 bg-gray-700 text-white rounded text-sm">
              Add Shelf
            </button>
            <button onClick={savePlanogram} className="px-3 py-2 bg-blue-500 text-white rounded text-sm">
              Save Planogram
            </button>
            <button onClick={loadPlanogram} className="px-3 py-2 bg-green-500 text-white rounded text-sm">
              Load Planogram
            </button>
          </div>
        </div>

        {activeSlotId && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-white p-4 rounded shadow-md border max-w-[90vw] max-h-[60vh] overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2">Select a product for this slot</h4>
            <div className="flex flex-wrap gap-2">
              {filteredProducts.map(product => (
                <img
                  key={product.id}
                  src={product.image}
                  alt={product.name}
                  onClick={() => {
                    setPlanogram(prev => ({
                      ...prev,
                      [activeSlotId]: product.id
                    }));
                    setActiveSlotId(null);
                  }}
                  className="w-16 h-20 border cursor-pointer object-contain hover:shadow-md"
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSlotId(null)}
              className="mt-3 px-3 py-1 bg-gray-300 text-sm rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

export default PlanogramView;
