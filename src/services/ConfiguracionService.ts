import axios from '../lib/axios';

export interface Configuracion {
    id: number;
    nombre_hotel: string;
    logo_path: string | null;
    logo_url: string | null;
    porcentaje_iva: number;
    direccion: string | null;
    telefono: string | null;
    correo: string | null;
    reservas_nativas_activas: boolean;
    reservas_libres_activas: boolean;
}

const ConfiguracionService = {
    async getConfiguracion(token: string): Promise<Configuracion> {
        try {
            const response = await axios.get('/configuracion', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener la configuración');
        }
    },

    async updateConfiguracion(
        token: string,
        data: {
            nombre_hotel?: string;
            porcentaje_iva?: number;
            direccion?: string;
            telefono?: string;
            correo?: string;
            reservas_nativas_activas?: boolean;
            reservas_libres_activas?: boolean;
        },
        logo?: File | null
    ): Promise<Configuracion> {
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) formData.append(key, String(value));
            });
            if (logo) formData.append('logo', logo);

            const response = await axios.put('/configuracion', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message ?? 'Error al actualizar la configuración');
        }
    },

    // Solo admin: obtiene la api key vigente para el canal de reservas libres
    async getReservasLibresApiKey(token: string): Promise<string> {
        try {
            const response = await axios.get('/configuracion/reservas-libres-api-key', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.reservas_libres_api_key;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message ?? 'Error al obtener la api key');
        }
    },

    // Solo admin: invalida la key anterior y genera una nueva
    async regenerarReservasLibresApiKey(token: string): Promise<string> {
        try {
            const response = await axios.post(
                '/configuracion/reservas-libres-api-key/regenerar',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.reservas_libres_api_key;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message ?? 'Error al regenerar la api key');
        }
    },
};

export default ConfiguracionService;
