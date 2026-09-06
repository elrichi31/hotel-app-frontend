import React from 'react'
import ConfiguracionPage from './ConfiguracionPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configuración',
    description: 'Configuración general del hotel',
}

export default async function page() {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token?.token || '';
    return (
        <ConfiguracionPage token={token} />
    )
}
