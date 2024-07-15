import axios from '../lib/axios';
import { Client } from '@/types/types';
const ClientService = {
    async getAllClients(token: string): Promise<Client[]> {
        try {
            const response = await axios.get('/clientes', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener los clientes');
        }
    },

    async getClientById(id: number): Promise<Client> {
        try {
            const response = await axios.get(`/clientes/${id}`);
            return response.data;
        } catch (error) {
            throw new Error('Error al obtener el cliente');
        }
    },

    async getClientByCedula(cedula: string, token: string): Promise<Client> {
        try {
            const response = await axios.get(`/personas/validate/${encodeURIComponent(cedula)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response.status === 404) {
                throw new Error('Cliente no encontrado');
            } else {
                throw new Error('Error al obtener el cliente');
            }
        }
    },

    async updateClient(id: number, updatedClient: Partial<Client>, token: string): Promise<Client> {
        try {
            const response = await axios.put(`/clientes/${id}`, updatedClient, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al actualizar el cliente');
        }
    },

    async createClient(newClient: any, token: string): Promise<Client> {
        try {
            const response = await axios.post('/personas', newClient, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al crear el cliente');
        }
    },

    async deleteClient(id: number, token: string): Promise<void> {
        try {
            await axios.delete(`/clientes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            throw new Error('Error al eliminar el cliente');
        }
    },
};

export default ClientService;
