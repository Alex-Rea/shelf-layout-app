import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function PlanogramView({ shelves, planogram, setPlanogram, products }) {
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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row h-full w-full">

        {/* Sidebar */}
        <div className="w-full md:w-1/4 p-4 bg-gray-100 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Planogram Tools</h3>

          <div className="flex flex-col gap-2 mb-4">
            <button onClick={savePlanogram} className="px-3 py-2 bg-blue-500 text-white rounded text-sm">Save Planogram</button>
            <button onClick={loadPlanogram} className="px-3 py-2 bg-green-500 text-white rounded text-sm">Load Planogram</button>
            <button onClick={() => alert("Add Shelf logic to come")} className="px-3 py-2 bg-gray-600 text-white rounded text-sm">Add Shelf</button>
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
        <div className="flex-1 p-4 bg-white overflow-y-auto">
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
      </div>
    </DragDropContext>
  );
}

export default PlanogramView;
