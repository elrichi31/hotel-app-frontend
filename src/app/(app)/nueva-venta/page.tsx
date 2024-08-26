import React from 'react';
import { Metadata } from 'next';
import CollapseView from '@/views/CollapseView';

export const metadata: Metadata = {
    title: 'Registro de cliente',
    description: 'Dashboard page',
}

const RegisterClientPage: React.FC = () => {
    return (
        <div>
            <CollapseView/>
        </div>

    );
};

export default RegisterClientPage;
