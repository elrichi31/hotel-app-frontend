"use client"
import React, { useState } from 'react';
import { Card, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import EditRoomModal from './RoomModal';

const RoomsCard = ({ room }: any) => {
    const { numero, tipo, precio, estado, descripcion, numero_camas } = room;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        console.log('show modal', isModalOpen);
        setIsModalOpen(true);
    };
    const handleOk = (values: any) => {
        console.log('Received values:', values);
        message.success('Room updated successfully');
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const titleNew = <div className='flex justify-between'>
        <p>Habitacion {numero}</p>
        {estado === 'Disponible' ? (<Tag color="green">Libre</Tag>) : (<Tag color="orange">Ocupado</Tag>)}
    </div>;

    const eliminar = <Popconfirm title="¿Estás seguro de eliminar esta habitación?" okText="Si" cancelText="No">
        <CloseOutlined />
    </Popconfirm>;

    const editar = <>
        <EditOutlined onClick={showModal}/>
        <EditRoomModal open={isModalOpen} onCancel={handleCancel} onOk={handleOk} room={room} edit={true}/>
    </>

    return (
        <Card title={titleNew} style={{ width: 250, margin: '16px' }} actions={[editar, eliminar]}>
            <p><strong>Tipo:</strong> {tipo}</p>
            <p><strong>Precio:</strong> ${precio}</p>
            <p><strong>Descripción:</strong> {descripcion}</p>
            <p><strong>Número de camas:</strong> {numero_camas}</p>
        </Card>
    );
};

export default RoomsCard;
