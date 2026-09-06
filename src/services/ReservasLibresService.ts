import axios from '../lib/axios';

export type EstadoReservaLibre = 'pendiente_revision' | 'validada' | 'descartada';

export interface ReservaLibre {
    id: number;
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    numero_personas: number;
    habitacion_descripcion: string;
    origen: string;
    referencia_externa: string | null;
    total: number | null;
    notas: string | null;
    estado: EstadoReservaLibre;
    created_at: string;
}

const ReservasLibresService = {
    async getAll(token: string): Promise<ReservaLibre[]> {
        try {
            const response = await axios.get('/reservas-libres', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener las reservas libres');
        }
    },

    async validar(id: number, token: string): Promise<any> {
        try {
            const response = await axios.post(`/reservas-libres/${id}/validar`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message ?? 'Error al validar la reserva libre');
        }
    },

    async descartar(id: number, token: string): Promise<any> {
        try {
            const response = await axios.post(`/reservas-libres/${id}/descartar`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message ?? 'Error al descartar la reserva libre');
        }
    },

    async delete(id: number, token: string): Promise<void> {
        try {
            await axios.delete(`/reservas-libres/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            throw new Error('Error al eliminar la reserva libre');
        }
    },
};

export default ReservasLibresService;
