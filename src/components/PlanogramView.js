import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function PlanogramView({ shelves, planogram, setPlanogram }) {
  const products = [
    { id: 'lays-classic', name: 'Lays', image: '/images/products/00028400090858_C1C1_s01.jpg' },
  ];

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    setPlanogram(prev => ({
      ...prev,
      [destination.droppableId]: draggableId
    }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Product Gallery */}
      <Droppable droppableId="product-gallery" direction="horizontal" isDropDisabled>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="mb-4 flex space-x-4"
          >
            {products.map((product, index) => (
              <Draggable draggableId={product.id} index={index} key={product.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="w-16 h-20 border bg-white"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Shelf Grid */}
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
    </DragDropContext>
  );
}

export default PlanogramView;
