import axios from '../lib/axios';
import { Room } from '@/types/types';

const RoomService = {
    async getAllRooms(token: any): Promise<Room[]> {
        try {
            const response = await axios.get(`/habitaciones`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener las habitaciones');
        }
    },

    async getRoomById(id: number): Promise<Room> {
        try {
            const response = await axios.get(`/habitaciones/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener la habitación');
        }
    },

    async updateRoom(id: number, updatedRoom: Partial<Room>, token: string): Promise<Room> {
        try {
            const response = await axios.put(`/habitaciones/${id}`, updatedRoom, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al actualizar la habitación');
        }
    },

    async createRoom(newRoom: Room, token: String): Promise<Room> {
        try {
            const response = await axios.post(`/habitaciones`, newRoom, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al crear la habitación');
        }
    },

    async deleteRoom(id: number, token: string): Promise<void> {
        try {
            const response = await axios.delete(`/habitaciones/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al eliminar la habitación');
        }
    },
};

export default RoomService;
