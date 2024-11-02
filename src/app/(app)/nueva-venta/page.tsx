import React from 'react';
import { Metadata } from 'next';
import CollapseView from '@/views/CollapseView';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const metadata: Metadata = {
    title: 'Registro de cliente',
    description: 'Dashboard page',
}

const RegisterClientPage = async () => {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token.token;

    return (
        <div>
            <CollapseView token={token || ''} />
        </div>
    );
};

export default RegisterClientPage;
