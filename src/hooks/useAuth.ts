import useSWR from 'swr';
import axios from '../lib/axios';
import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { message } from 'antd';

export const useAuth = ({ middleware, redirectIfAuthenticated }: any = {}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Configurar axios para incluir el token en todas las solicitudes
    axios.interceptors.request.use(config => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const fetcher = (url: string) => axios.get(url).then(res => res.data);
    const { data: user, error, mutate } = useSWR('/api/user', fetcher, {
        // shouldRetryOnError: false,
        // revalidateOnFocus: false,
        // dedupingInterval: 5000, // Evita solicitudes duplicadas en un intervalo de 60 segundos
        onSuccess: () => setLoading(false),
        onError: () => {
            setLoading(false);
            if (error && error.response && error.response.status === 401) {
                Cookies.remove('token');
                router.push('/login');
            }
        },
    });

    const register = async ({ setErrors, ...props }: any) => {
        setErrors([]);

        return axios
            .post('/register', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error;
                setErrors(error.response.data.errors);
            });
    };

    const login = async ({ setErrors, ...props }: any) => {
        setErrors([]);

        return axios
            .post('/login', props)
            .then(response => {
                Cookies.set('token', response.data.token.token, { expires: 7 }); // Configura la cookie para que expire en 7 días
                setLoading(false);
                mutate().then(() => {
                    router.push('/dashboard');
                });
            })
            .catch(error => {
                if (error.response.status !== 422) throw error;
                setErrors(error.response.data.errors);
                setLoading(false);
            });
    };

    const logout = async () => {
        await axios.post('/logout').then(() => {
            Cookies.remove('token');
            setLoading(false);
            mutate(null, false);
            router.push('/login');
        }).catch((err) => {
            message.error('Error logging out');
            Cookies.remove('token');
            setLoading(false);
            mutate(null, false);
            router.push('/login');
        });
    };

    const handleRevalidation = useCallback(() => {
        const token = Cookies.get('token');
        if (token) {
            mutate();
        } else {
            setLoading(false);
        }
    }, [mutate]);

    useEffect(() => {
        handleRevalidation();
        if (middleware === 'guest' && redirectIfAuthenticated && user) {
            router.push(redirectIfAuthenticated);
        }
        if (middleware === 'auth' && error) {
            message.error('You must be logged in to access this page');
            router.push('/login');
        }
    }, [user, error, handleRevalidation]);

    return {
        user,
        register,
        login,
        logout,
        loading,
    };
};
