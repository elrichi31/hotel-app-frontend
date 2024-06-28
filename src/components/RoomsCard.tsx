"use client"
import React, { useState } from 'react';
import { Card, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import EditRoomModal from './RoomModal';
import RoomService from '@/services/RoomService';
import { useSession } from 'next-auth/react';

const RoomsCard = ({ room, onUpdate }: any) => {
    const { id, numero, tipo, precio, estado, descripcion, numero_camas } = room;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session } = useSession();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async (values: any) => {
        try {
            const updatedRoom = { ...room, ...values };
            if (session?.user?.token?.token) {
                const updated = await RoomService.updateRoom(id, updatedRoom, session.user.token.token);
                message.success('Habitación actualizada exitosamente');
                setIsModalOpen(false);
                onUpdate(updated);
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
            if (session?.user?.token?.token) {
                await RoomService.deleteRoom(id, session.user.token.token);
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
            <p><strong>Precio:</strong> ${precio}</p>
            <p><strong>Descripción:</strong> {descripcion}</p>
            <p><strong>Número de camas:</strong> {numero_camas}</p>
            <EditRoomModal open={isModalOpen} onCancel={handleCancel} onOk={handleOk} room={room} edit={true} />
        </Card>
    );
};

export default RoomsCard;
