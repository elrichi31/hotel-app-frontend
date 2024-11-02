"use client";
import React, { useState } from 'react';
import { Card, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import EditRoomModal from './RoomModal';
import RoomService from '@/services/RoomService';

interface RoomsCardProps {
  room: any;
  token: string;
  onUpdate: (updatedRoom: any) => void;
}

const RoomsCard: React.FC<RoomsCardProps> = ({ room, token, onUpdate }) => {
  const { id, numero, tipo, estado, descripcion, numero_camas, precios = [] } = room;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async (values: any) => {
    try {
      const updatedRoom = { ...room, ...values };
      if (token) {
        const updated = await RoomService.updateRoom(id, updatedRoom, token);
        message.success('Habitación actualizada exitosamente');
        setIsModalOpen(false);
        onUpdate(updated); // Pasa la habitación actualizada al estado
      }
    } catch (error) {
      console.error('Error updating room:', error);
      message.error('Error al actualizar la habitación');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const popConfirm = async () => {
    try {
      if (token) {
        await RoomService.deleteRoom(id, token);
        message.success('Habitación eliminada exitosamente');
        onUpdate(id); // Elimina localmente la habitación eliminada
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error('Error al eliminar la habitación');
    }
  };

  const titleNew = (
    <div className='flex justify-between'>
      <p>Habitación {numero}</p>
      {estado === 'Libre' ? (<Tag color="green">Libre</Tag>) : (<Tag color="orange">Ocupado</Tag>)}
    </div>
  );

  const eliminar = (
    <Popconfirm title="¿Estás seguro de eliminar esta habitación?" okText="Si" cancelText="No" onConfirm={popConfirm}>
      <CloseOutlined />
    </Popconfirm>
  );

  const editar = (
    <>
      <EditOutlined onClick={showModal} />
    </>
  );

  return (
    <Card title={titleNew} style={{ width: 250, margin: '16px' }} actions={[editar, eliminar]}>
      <p><strong>Tipo:</strong> {tipo}</p>
      <p><strong>Descripción:</strong> {descripcion}</p>
      <p><strong>Número de camas:</strong> {numero_camas}</p>
      <p><strong>Precios:</strong></p>
      <ul>
        {precios.map((precio: any, index: number) => (
          <li key={index}>
            {precio.numero_personas} personas: ${precio.precio}
          </li>
        ))}
      </ul>
      <EditRoomModal open={isModalOpen} onCancel={handleCancel} onOk={handleOk} room={room} edit={true} />
    </Card>
  );
};

export default RoomsCard;
