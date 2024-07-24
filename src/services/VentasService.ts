import axios from '../lib/axios';

const VentasService = {
    async getAllVentas(token: string): Promise<any> {
        try {
            const response = await axios.get('/ventas', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener las ventas');
        }
    },
    async getVenta(id: number, token: string): Promise<any> {
        try{
            const response = await axios.get(`/ventas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener la venta');
        }
    },
    async createVenta(token: string, venta: any): Promise<any> {
        try {
            const response = await axios.post('/ventas', venta, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al crear la venta');
        }
    },

    async updateVenta(token: string, id: number, venta: any): Promise<any> {
        try {
            const response = await axios.put(`/ventas/${id}`, venta, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al actualizar la venta');
        }
    },

    async deleteVenta(token: string, id: number): Promise<any> {
        try {
            const response = await axios.delete(`/ventas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al eliminar la venta');
        }
    }
}

export default VentasService; 