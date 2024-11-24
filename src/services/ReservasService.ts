import axios from '../lib/axios';
import { ReservaData } from '@/types/types';

const ReservaService = {
    // Obtener todas las reservas
    async getAllReservas(token: string): Promise<ReservaData[]> {
        try {
            const response = await axios.get(`/reservas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener las reservas');
        }
    },

    // Obtener una reserva por ID
    async getReservaById(id: number, token: string): Promise<ReservaData> {
        try {
            const response = await axios.get(`/reservas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener la reserva');
        }
    },

    // Crear una nueva reserva
    async createReserva(newReserva: ReservaData): Promise<ReservaData> {
        try {
            const response = await axios.post(`/reservas`, newReserva);
            return response.data;
        } catch (error) {
            throw new Error('Error al crear la reserva');
        }
    },

    // Actualizar una reserva existente
    async updateReserva(id: number, updatedReserva: Partial<ReservaData>, token: string): Promise<ReservaData> {
        try {
            const response = await axios.put(`/reservas/${id}`, updatedReserva, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al actualizar la reserva');
        }
    },

    // Eliminar una reserva
    async deleteReserva(id: number, token: string): Promise<void> {
        try {
            await axios.delete(`/reservas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            throw new Error('Error al eliminar la reserva');
        }
    },

    // Verificar la disponibilidad de una habitación para una fecha específica
    async checkAvailability(fecha_inicio: string, fecha_fin: string): Promise<any> {
        try {
            const response = await axios.post(
                `/reservas/disponible`,
                {
                    fecha_inicio,
                    fecha_fin,
                }
            );
            return response.status = 200;
        } catch (error) {
            throw new Error('Error al verificar la disponibilidad de la reserva');
        }
    },

    async confirmReserva(id: string): Promise<void> {
        try {
            const response = await axios.get(`/confirm-reserva/${id}`);
        } catch (error) {
            throw new Error('Error al confirmar la reserva');
        }
    }
};

export default ReservaService;
