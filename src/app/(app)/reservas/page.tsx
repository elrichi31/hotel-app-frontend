import React from 'react'
import ReservasPage from './ReservasPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Panel de reservas',
    description: 'panel de reservas',
}

export default async function page() {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token?.token || '';
    return (
        <ReservasPage token={token} />
    )
}
