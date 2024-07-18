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
}

export default VentasService; 