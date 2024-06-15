"use client";
import useSWR from 'swr';
import axios from '../lib/axios';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export const useAuth = ({ middleware, redirectIfAuthenticated }: any = {}) => {
    const router = useRouter();

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
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        dedupingInterval: 60000, // Evita solicitudes duplicadas en un intervalo de 60 segundos
    });

    const register = async ({ setErrors, setStatus, ...props }: any) => {
        setErrors([]);
        setStatus('loading');

        return axios
            .post('/register', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error;
                setErrors(error.response.data.errors);
                setStatus('');
            });
    };

    const login = async ({ setErrors, setStatus, ...props }: any) => {
        setErrors([]);
        setStatus('loading');

        return axios
            .post('/login', props)
            .then(response => {
                Cookies.set('token', response.data.token.token, { expires: 7 }); // Configura la cookie para que expire en 7 días
                mutate();
            })
            .catch(error => {
                if (error.response.status !== 422) throw error;
                setErrors(error.response.data.errors);
                setStatus('');
            });
    };

    const logout = async () => {
        if (!error) {
            await axios.post('/logout').then(() => {
                Cookies.remove('token');
                mutate();
            });
        }
        window.location.pathname = '/login';
    };

    const handleRevalidation = useCallback(() => {
        const token = Cookies.get('token');
        if (token) {
            mutate();
        }
    }, [mutate]);

    useEffect(() => {
        handleRevalidation();
        if (middleware === 'guest' && redirectIfAuthenticated && user) {
            router.push(redirectIfAuthenticated);
        }
        if (middleware === 'auth' && error) {
            logout();
        }
    }, [user, error, handleRevalidation]);

    return {
        user,
        register,
        login,
        logout,
    };
};
