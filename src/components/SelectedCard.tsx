import { Tag } from 'antd';
import React, { useState } from 'react';

const SelectableCard = ({ room, onSelect, isSelected }: any) => {
  const handleCardClick = () => {
    onSelect();
  };

  return (
    <div
      className={`p-4 w-[240px] border rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
      onClick={handleCardClick}
    >
      <div className='flex justify-between'>
        <h3 className="text-lg font-semibold">Habitacion {room.numero}</h3>
        <div>
          {room.estado === 'Libre' ? (<Tag color="green">Libre</Tag>) : (<Tag color="orange">Ocupado</Tag>)}
        </div>
      </div>
      <p>Camas: {room.numero_camas}</p>
      <p>Precio: ${room.precio}</p>
      <p>Tipo: {room.tipo}</p>
    </div>
  );
};

export default SelectableCard;
