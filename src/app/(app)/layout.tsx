"use client"
import React, { ReactNode, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { useSession, signOut } from 'next-auth/react';
import axios from '../../lib/axios';
import { message } from 'antd';
import ConfiguracionService, { Configuracion } from '@/services/ConfiguracionService';
type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const [user, setUser] = useState(null);
    const [config, setConfig] = useState<Configuracion | null>(null);
    const { data: session, status } = useSession();
    // `session` es un objeto nuevo en cada refresco de NextAuth. Dependemos del
    // token en sí para no repedir el usuario al backend en cada render.
    const token = session?.user?.token?.token;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (token) {
                    const response = await axios.get('/api/user', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [token]);

    useEffect(() => {
        if (!token) return;
        ConfiguracionService.getConfiguracion(token)
            .then(setConfig)
            .catch((error) => console.error('Error fetching configuracion:', error));
    }, [token]);

    const logout = async () => {
        try {
            if (session?.user?.token?.token) {
                const token = session.user.token.token;
                console.log(token);
                signOut();
                const response = await axios.post('/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Logout response:', response.data);
                message.success('Logged out successfully');
            } else {
                console.log('No token found for logout');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };


    if (status === "loading") {
        return <Loading />;
    }
    // Sin SessionAuthProvider aquí: el layout raíz ya monta uno. Anidarlos hacía
    // que cada instancia pidiera /api/auth/session por su cuenta en cada navegación.
    return (
        <Navbar user={user} logout={logout} config={config}>
            {children}
        </Navbar>
    );
};

export default Layout;
