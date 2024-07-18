import { Tag, Select } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

const SelectableCard = ({ room, onSelect, isSelected }: any) => {
  const [selectedPrice, setSelectedPrice] = useState(room.precios[0]?.precio);
  const [selectedPriceId, setSelectedPriceId] = useState(room.precios[0]?.id);

  const handleCardClick = () => {
    onSelect(selectedPrice, selectedPriceId);
  };

  const handlePriceChange = (value: any, option: any) => {
    setSelectedPrice(value);
    setSelectedPriceId(option.key);
    console.log('Selected Price:', value);
    console.log('Selected Price ID:', option.key);
    onSelect(value, option.key);
  };

  return (
    <div>
      <div
        className={`p-4 w-[240px] border rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
        onClick={handleCardClick}
      >
        <div className='flex justify-between'>
          <h3 className="text-lg font-semibold">Habitación {room.numero}</h3>
          <div>
            {room.estado === 'Libre' ? (<Tag color="green">Libre</Tag>) : (<Tag color="orange">Ocupado</Tag>)}
          </div>
        </div>
        <p>Camas: {room.numero_camas}</p>
        <p>Tipo: {room.tipo}</p>
        <p>Descripción: {room.descripcion}</p>
      </div>
      <Select value={selectedPrice} onChange={handlePriceChange} className="w-full">
        {room.precios.map((precio: any, index: number) => (
          <Option key={precio.id} value={precio.precio}>
            {precio.numero_personas} personas: ${precio.precio}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SelectableCard;
