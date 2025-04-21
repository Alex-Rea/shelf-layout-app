import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';


function PlanogramView({ shelves, setShelves, planogram, setPlanogram, products }) {
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
  
    if (!elements) {
      alert("Template not found.");
      return;
    }
  
    // Parse shelf lines and dividers from template
    const slotElements = elements.filter(el => el.type === 'slot');
    if (slotElements.length === 0) {
      alert("No slots found in this shelf template.");
      return;
    }
  
    const newShelf = {
      id: `shelf_${shelves.length + 1}`,
      slots: slotElements.map((slot, i) => ({
        id: `slot_${shelves.length + 1}_${i + 1}`,
      }))
    };
  
    setShelves(prev => [...prev, newShelf]);
  };
  

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row h-full w-full">

        {/* Sidebar */}
        <div className="w-full md:w-1/4 p-4 bg-gray-100 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Planogram Tools</h3>

          <div className="flex flex-col gap-2 mb-4">
            <button onClick={savePlanogram} className="px-3 py-2 bg-blue-500 text-white rounded text-sm">Save Planogram</button>
            <button onClick={loadPlanogram} className="px-3 py-2 bg-green-500 text-white rounded text-sm">Load Planogram</button>
            <button onClick={handleAddShelfFromTemplate} className="px-3 py-2 bg-gray-600 text-white rounded text-sm">
              Add Shelf
            </button>
          </div>

          <h4 className="text-md font-medium mb-2">Product Gallery</h4>
          <Droppable droppableId="product-gallery" direction="horizontal" isDropDisabled>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-wrap gap-2"
              >
                {products.map((product, index) => (
                  <Draggable key={product.id} draggableId={product.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.dragHandleProps}
                        {...provided.draggableProps}
                        className="w-16 h-20 border bg-white"
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
        </div>

        {/* Main planogram grid */}
        <div className="flex-1 p-4 bg-white overflow-hidden">
          <TransformWrapper
            minScale={0.5}
            maxScale={3}
            doubleClick={{ disabled: true }}
            wheel={{ step: 0.05 }}
          >
            <TransformComponent>
              <div>
                {shelves.map((shelf) => (
                  <div key={shelf.id} className="flex space-x-2 mb-4">
                    {shelf.slots.map((slot) => {
                      const productId = planogram[slot.id];
                      const product = products.find(p => p.id === productId);

                      return (
                        <Droppable droppableId={slot.id} key={slot.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="w-16 h-24 border border-dashed bg-gray-100 flex items-center justify-center"
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
      </div>
    </DragDropContext>
  );
}

export default PlanogramView;
