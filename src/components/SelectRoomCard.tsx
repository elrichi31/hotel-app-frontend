import { Tag, Select } from 'antd';
import React, { useState, useEffect } from 'react';

const { Option } = Select;

const SelectRoomCard = ({ room, onSelect, isSelected, precios, noTags }: any) => {
    const [selectedPrice, setSelectedPrice] = useState(room.precios && room.precios.length > 0 ? room.precios[0].precio : null);
    const [selectedPriceId, setSelectedPriceId] = useState(room.precios && room.precios.length > 0 ? room.precios[0].id : null);



    useEffect(() => {
        if (isSelected) {
            onSelect(selectedPrice, selectedPriceId);
        }
    }, [selectedPrice, selectedPriceId, isSelected]);

    if (precios) {
        useEffect(() => {
            room.precios.forEach((precio: any) => {
                precios.forEach((precioVenta: any) => {
                    if (precio.id === precioVenta.id) {
                        setSelectedPrice(precio.precio);
                        setSelectedPriceId(precio.id);
                    }
                });
            });
        }, [precios, room.precios]);
    }


    const handleCardClick = () => {
        if (isSelected) {
            onSelect(null, null); // Deselect
        } else {
            onSelect(selectedPrice, selectedPriceId);
        }
    };

    const handlePriceChange = (value: any, option: any) => {
        setSelectedPrice(value);
        setSelectedPriceId(option.key);
    };

    return (
        <div className={`p-4 w-[240px] border rounded-lg cursor-pointer transition-colors duration-300 ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
        >
            <div
                onClick={handleCardClick}
            >
                <div className='flex justify-between'>
                    <h3 className="text-lg font-semibold">Habitación {room.numero}</h3>
                    {
                        precios || noTags ? null :
                            <div>
                                {room.estado === 'Libre' ? (<Tag color="green">Libre</Tag>) : (<Tag color="orange">Ocupado</Tag>)}
                            </div>
                    }
                </div>
                <p>Camas: {room.numero_camas}</p>
                <p>Tipo: {room.tipo}</p>
                <p>Descripción: {room.descripcion}</p>
            </div>
            <Select
                value={selectedPrice}
                onChange={handlePriceChange}
                className="w-full mt-3"
            >
                {room.precios.map((precio: any) => (
                    <Option key={precio.id} value={precio.precio}>
                        {precio.numero_personas} personas: ${precio.precio}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default SelectRoomCard;
