"use client";
import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';
type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    const { user, logout, loading } = useAuth({ middleware: 'auth' });
    if (loading) {
        return <Loading/>; // Indicador de carga
    }
    if (!user) {
        return null; // Optional: Puedes retornar un indicador de carga aquí
    }
    return (
        <div>
            <Navbar user={user} logout={logout}>
                {children}
            </Navbar>
        </div>
    );
};

export default Layout;
