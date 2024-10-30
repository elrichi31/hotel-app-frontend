import axios from '../lib/axios';
import { User } from '@/types/types';

const UserService = {
  // Obtener todos los usuarios
  async getAllUsers(token: string): Promise<User[]> {
    try {
      const response = await axios.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener los usuarios');
    }
  },

  // Obtener un usuario por su ID
  async getUserById(id: number, token: string): Promise<User> {
    try {
      const response = await axios.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        throw new Error('Usuario no encontrado');
      } else {
        throw new Error('Error al obtener el usuario');
      }
    }
  },

  // Crear un nuevo usuario
  async createUser(newUser: Partial<User>, token: string): Promise<User> {
    try {
        console.log('newUser:', newUser);
      const response = await axios.post('/users', newUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al crear el usuario');
    }
  },

  // Actualizar un usuario
  async updateUser(id: number, updatedUser: Partial<User>, token: string): Promise<User> {
    try {
      const response = await axios.put(`/users/${id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar el usuario');
    }
  },

  // Eliminar un usuario
  async deleteUser(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw new Error('Error al eliminar el usuario');
    }
  },
};

export default UserService;
