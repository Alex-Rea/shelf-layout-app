import React from 'react';

function ShelfEditor({ shelves, setShelves }) {
  const addShelf = () => {
    const newShelf = {
      id: `shelf_${shelves.length + 1}`,
      slots: Array(5).fill().map((_, i) => ({
        id: `slot_${shelves.length}_${i}`,
      }))
    };
    setShelves([...shelves, newShelf]);
  };

  return (
    <div>
      <button className="mb-4 px-3 py-2 bg-gray-300" onClick={addShelf}>Add Shelf</button>
      <div className="space-y-4">
        {shelves.map((shelf) => (
          <div key={shelf.id} className="flex space-x-2 border p-2 bg-gray-100">
            {shelf.slots.map((slot) => (
              <div key={slot.id} className="w-16 h-24 border-2 border-dashed bg-white flex justify-center items-center">
                {slot.id}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShelfEditor;
