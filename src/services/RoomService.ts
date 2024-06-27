import axios from '../lib/axios';

interface Room {
    number: number;
    type: string;
    price: number;
    status: string;
    description: string;
    beds: number;
}

const RoomService = {
    async getAllRooms(token: any): Promise<Room[]> {
        console.log(token);
        try {
            const response = await axios.get(`/habitaciones`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
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

    async updateRoom(id: number, updatedRoom: Partial<Room>): Promise<Room> {
        try {
            const response = await axios.put(`/habitaciones/${id}`, updatedRoom);
            return response.data;
        } catch (error) {
            throw new Error('Error al actualizar la habitación');
        }
    },

    async createRoom(newRoom: Room): Promise<Room> {
        try {
            const response = await axios.post(`/habitaciones`, newRoom);
            return response.data;
        } catch (error) {
            throw new Error('Error al crear la habitación');
        }
    },

    async deleteRoom(id: number): Promise<void> {
        try {
            await axios.delete(`/habitaciones/${id}`);
        } catch (error) {
            throw new Error('Error al eliminar la habitación');
        }
    },
};

export default RoomService;
