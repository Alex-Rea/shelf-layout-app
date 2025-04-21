import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function PlanogramView({ shelves, planogram, setPlanogram }) {
  const products = [
    { id: 'lays-classic', name: 'Lays', image: '/images/products/lays-classic.webp' },
    { id: 'doritos', name: 'Doritos', image: '/images/products/doritos-cool-ranch.webp' },
  ];

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    setPlanogram({ ...planogram, [destination.droppableId]: draggableId });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mb-4 flex space-x-4">
        {products.map((product) => (
          <Draggable draggableId={product.id} index={0} key={product.id}>
            {(provided) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                className="w-16 h-20 border bg-white"
              >
                <img src={product.image} alt={product.name} className="object-contain w-full h-full" />
              </div>
            )}
          </Draggable>
        ))}
      </div>

      {shelves.map((shelf) => (
        <div key={shelf.id} className="flex space-x-2 mb-4">
          {shelf.slots.map((slot) => (
            <Droppable droppableId={slot.id} key={slot.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-16 h-24 border bg-gray-200 flex items-center justify-center"
                >
                  {planogram[slot.id] ? (
                    <img src={`/images/products/${planogram[slot.id]}.webp`} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400">Empty</span>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      ))}
    </DragDropContext>
  );
}

export default PlanogramView;
