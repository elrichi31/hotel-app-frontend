import axios from '../lib/axios';

export interface DashboardStats {
    revenue: { total: number; delta: number; daily: { day: number; actual: number | null; anterior: number }[] };
    orders: { total: number; delta: number };
    facturas: { total: number; delta: number };
    reservas: { total: number; delta: number };
    roomTypes: { name: string; revenue: number; nights: number }[];
    weekday: { day: string; checkins: number }[];
    occupancy: { ocupadas: number; libres: number; total: number };
    topRooms: { numero: string; tipo: string; revenue: number }[];
    topRoomsByNights: { numero: string; tipo: string; nights: number }[];
    facturasPorEstado: { name: string; value: number }[];
    huespedes: { total: number; delta: number; porProcedencia: { name: string; pct: number }[] };
}

const DashboardService = {
    async getStats(token: string): Promise<DashboardStats> {
        try {
            const response = await axios.get('/dashboard/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener las estadísticas del panel');
        }
    },
};

export default DashboardService;
