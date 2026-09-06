import React from 'react';
import { Metadata } from 'next';
import VentaWizard from '@/views/VentaWizard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const metadata: Metadata = {
    title: 'Nueva venta',
    description: 'Registro de cliente y alta de venta',
}

const NuevaVentaPage = async () => {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token.token;

    return <VentaWizard token={token || ''} />;
};

export default NuevaVentaPage;
