// services/AuthService.ts
import axios from '../lib/axios';

interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}


const AuthService = {
  register: async (data: any) => {
    try {
      const response = await axios.post("/register", data);
      console.log('Registration response:', response);
      return response.data;
    } catch (error: any) {
      throw error.response ? error.response.data : new Error('Error al intentar registrarse');
    }
  },
};

export default AuthService;
