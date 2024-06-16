"use client";
import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '../../hooks/useAuth';

type ProtectedLayoutProps = {
    children: ReactNode;
};

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    console.log('user', user);
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div>Loading...</div>; // Muestra un indicador de carga mientras se obtiene el usuario
    }

    if (!user) {
        return null;
    }

    return (
        <div>
            <Navbar user={user} logout={logout} />
            <main>{children}</main>
        </div>
    );
};

export default ProtectedLayout;
