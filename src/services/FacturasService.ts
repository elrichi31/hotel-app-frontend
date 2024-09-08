import axios from '../lib/axios';

const FacturasService = {
    async getAllFacturas(token: string): Promise<any> {
        try {
            const response = await axios.get('/facturas', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener las facturas');
        }
    },

    async getFacturasByVenta(ventaId: number, token: string): Promise<any> {
        try {
            const response = await axios.get(`/facturas/venta/${ventaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {

            throw new Error(error.message || 'Error al obtener las facturas');
        }
    },

    async getFactura(id: number, token: string): Promise<any> {
        try {
            const response = await axios.get(`/facturas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener la factura');
        }
    },

    async createFactura(token: string, factura: any): Promise<any> {
        try {
            const response = await axios.post('/facturas', factura, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response.data.message || 'Error al crear la factura');
        }
    },

    async updateFactura(token: string, id: number, factura: any): Promise<any> {
        try {
            const response = await axios.put(`/facturas/${id}`, factura, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al actualizar la factura');
        }
    },

    async deleteFactura(token: string, id: number): Promise<any> {
        try {
            const response = await axios.delete(`/facturas/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al eliminar la factura');
        }
    }
}

export default FacturasService;
