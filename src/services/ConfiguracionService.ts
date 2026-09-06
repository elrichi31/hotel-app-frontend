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
        data: { nombre_hotel?: string; porcentaje_iva?: number; direccion?: string; telefono?: string; correo?: string },
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
};

export default ConfiguracionService;
