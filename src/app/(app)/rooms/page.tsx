'use client'
import React, { useEffect, useState } from 'react';
import RoomService from '@/services/RoomService';
import RoomsCard from '@/components/RoomsCard';
import { Room } from '@/types/types'; // Asegúrate de importar los tipos de Room correctos
import { useSession } from 'next-auth/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import RoomModal from '@/components/RoomModal';

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const { data: session, status } = useSession();
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
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                if (session?.user?.token?.token) {
                    console.log(session.user.token.token);
                    const roomsData: any = await RoomService.getAllRooms(session.user.token.token);
                    console.log(roomsData);
                    setRooms(roomsData);
                }
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchRooms();
    }, [session]);

    return (
        <div className='flex flex-wrap items-center justify-center'>
            {rooms.map((room) => (
                <RoomsCard key={room.numero} room={room} />
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

