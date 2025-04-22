import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

function PlanogramView({ shelves, setShelves, planogram, setPlanogram, products }) {
  const [activeSlotId, setActiveSlotId] = React.useState(null);
  
  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

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

  const handleAddShelfFromTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('shelfTemplates') || '{}');
    const name = prompt("Enter shelf template name to load:", Object.keys(templates)[0] || '');
    const elements = templates[name];
  
    if (!elements) return alert("Template not found.");
  
    // Assign a new shelf ID and map each element to include it
    const newShelfId = `shelf_${shelves.length + 1}`;
    const mappedElements = elements.map((el, idx) => ({
      ...el,
      id: `${newShelfId}_${el.type}_${idx + 1}`, // ensures unique ID
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
  
  const [galleryCollapsed, setGalleryCollapsed] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col h-full w-full overflow-hidden">

        {/* Main Canvas */}
        <div className="flex-1 p-4 bg-white overflow-hidden">
        <TransformWrapper
          minScale={0.2}
          maxScale={3}
          initialScale={0.6}
          doubleClick={{ disabled: true }}
          wheel={{ step: 0.05 }}
          panning={{ velocityDisabled: true }} // prevents jerkiness
        >
            <TransformComponent>
              <div
                className="relative"
                style={{
                  width: '1000px',      // ← gives room to scroll/zoom
                  height: '1000px',
                  backgroundColor: '#f9fafb',
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  position: 'relative',
                }}
              >
                {shelves.map((shelf) => (
                  <div key={shelf.id} className="absolute" style={{ top: 0, left: 0 }}>
                    {/* shelf.lines and slots here */}
                    {/* Render shelf-lines and divider-lines */}
                    {shelf.elements?.map((el) => {
                      if (el.type === 'shelf-line' || el.type === 'divider-line') {
                        return (
                          <div
                            key={el.id}
                            className={`absolute ${el.type === 'shelf-line' ? 'bg-black' : 'bg-black'}`}
                            style={{
                              width: `${el.width}px`,
                              height: `${el.height}px`,
                              left: `${el.x}px`,
                              top: `${el.y}px`,
                            }}
                          />
                        );
                      }
                      return null;
                    })}

              {/* Render slots */}
              {(shelf.elements || [])
                .filter(el => el.type === 'slot')
                .map((slot) => {
                  const productId = planogram[slot.id];
                  const product = products.find(p => p.id === productId);

                  return (
                    <Droppable droppableId={slot.id} key={slot.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="absolute border border-dashed bg-white flex items-center justify-center cursor-pointer"
                          onClick={() => setActiveSlotId(slot.id)}
                          style={{
                            left: `${slot.x}px`,
                            top: `${slot.y}px`,
                            width: `${slot.width}px`,
                            height: `${slot.height}px`,
                            zIndex: 10
                          }}
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
                  );
                })}
               </div>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

{/* Bottom Toolbar + Collapsible Product Gallery */}
<div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-10 px-4 pt-2">
  
  {/* Toggle Button */}
  <div className="flex justify-between items-center mb-2">
    <h4 className="text-sm font-semibold">Product Gallery</h4>
    <button
      className="text-xs text-blue-600 underline"
      onClick={() => setGalleryCollapsed(prev => !prev)}
    >
      {galleryCollapsed ? "Show Gallery" : "Hide Gallery"}
    </button>
  </div>

  {/* Gallery */}
  {!galleryCollapsed && (
    <>
      {/* Search Filter */}
      <div className="mb-2">
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
          className="text-xs text-gray-600 underline"
        >
          {showSearch ? "Hide Filter" : "Filter"}
        </button>
      </div>

      {/* Gallery Products */}
      <Droppable droppableId="product-gallery" direction="horizontal" isDropDisabled>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-wrap gap-2 overflow-x-auto pb-3"
          >
            {filteredProducts.map((product, index) => (
              <Draggable key={product.id} draggableId={product.id} index={index}>
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
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  )}

          {/* Toolbar Buttons */}
          <div className="flex flex-wrap justify-center gap-2 border-t pt-3 mt-2">
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
      </div>
    </DragDropContext>
  );
}

export default PlanogramView;
