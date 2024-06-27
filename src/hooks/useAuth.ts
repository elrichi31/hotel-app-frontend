import axios from '../lib/axios';
import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { message } from 'antd';

export const useAuth = ({ middleware, redirectIfAuthenticated }: any = {}) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configurar axios para incluir el token en todas las solicitudes
    axios.interceptors.request.use(config => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const handleLogin = async ({ setErrors, ...props }: any) => {
        setErrors([]);

        try {
            const response = await axios.post('/login', props);
            Cookies.set('token', response.data.token.token, { expires: 7 }); // Configura la cookie para que expire en 7 días
            setLoading(false);
            router.push('/dashboard');
        } catch (error: any) {
            if (error.response.status !== 422) throw error;
            setErrors(error.response.data.errors);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            Cookies.remove('token');
            setUser(null); // Limpia el estado del usuario
            setLoading(false);
            router.push('/login');
        } catch (err) {
            message.error('Error logging out');
            Cookies.remove('token');
            setUser(null); // Limpia el estado del usuario
            setLoading(false);
            router.push('/login');
        }
    };

    const handleRevalidation = useCallback(async () => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const response = await axios.get('/api/user');
                setUser(response.data); // Actualiza el estado del usuario
                setLoading(false);
            } catch (error: any) {
                if (error.response && error.response.status === 401) {
                    Cookies.remove('token');
                    setUser(null);
                    router.push('/login');
                } else {
                    setLoading(false);
                }
            }
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            await handleRevalidation();
            console.log()

            if (middleware === 'guest' && redirectIfAuthenticated && user) {
                router.push(redirectIfAuthenticated);
            }

            if (middleware === 'auth' && !user) {
                message.error('You must be logged in to access this page');
                router.push('/login');
            }
        };

        fetchData();
    }, [handleRevalidation, middleware, redirectIfAuthenticated, router, user]);

    return {
        user,
        login: handleLogin,
        logout: handleLogout,
        loading,
    };
};
