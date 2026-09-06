import React from 'react'
import ClientesPage from './ClientesPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Panel de clientes',
    description: 'panel de clientes',
}

export default async function page() {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token?.token || '';
    return (
        <ClientesPage token={token} />
    )
}
