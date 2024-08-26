'use client'
import React, { useEffect, useState } from 'react';
import RoomService from '@/services/RoomService';
import RoomsCard from '@/components/RoomsCard';
import { Room } from '@/types/types';
import { useSession } from 'next-auth/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import RoomModal from '@/components/RoomModal';
import Head from 'next/head';

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const { data: session, status } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRooms = async () => {
        try {
            if (session?.user?.token?.token) {
                const roomsData = await RoomService.getAllRooms(session.user.token.token);
                setRooms(roomsData);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [session]);

    const handleOk = async (values: any) => {
        try {
            if (session?.user?.token?.token) {
                const parsedValues = {...values, fechaInicioOcupacion: null, fechaFinOcupacion: null}
                console.log(parsedValues)
                const newRoom = await RoomService.createRoom(parsedValues, session.user.token.token);
                message.success('Habitación creada exitosamente');
                setIsModalOpen(false);
                setRooms([...rooms, newRoom]); // Agrega la nueva habitación al estado local
            }
        } catch (error: any) {
            console.error('Error creating room:', error);
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message); // Mostrar el mensaje de error específico
            } else {
                message.error('Error al crear la habitación');
            }
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleUpdateRoom = (updatedRoom: Room | number) => {
        if (typeof updatedRoom === 'number') {
            // Eliminar la habitación con el id correspondiente
            const updatedRooms = rooms.filter((room) => room.id !== updatedRoom);
            setRooms(updatedRooms);
        } else {
            // Actualizar la habitación existente
            const updatedRooms = rooms.map((room) =>
                room.id === updatedRoom.id ? updatedRoom : room
            );
            setRooms(updatedRooms);
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    return (
        <div className='flex flex-wrap items-center justify-center'>
            <head>
                <title>Habitaciones</title>
                <meta name="description" content="Página de habitaciones" />
            </head>
            {rooms.map((room) => (
                <RoomsCard key={room.numero} room={room} onUpdate={handleUpdateRoom} />
            ))}
            <div className='flex items-center justify-center'>
                <Button className='w-[250px] h-[260px] flex-col m-[16px]' onClick={showModal}>
                    <PlusCircleOutlined style={{fontSize: "20px"}} className='mx-10'/>
                    Crear habitación
                </Button>
                <RoomModal open={isModalOpen} onCancel={handleCancel} onOk={handleOk} room={null} edit={false}/>
            </div>
        </div>
    );
}
