import React from 'react';
import { Metadata } from 'next';
import { Button, message, Steps, theme } from 'antd';
import RegisterClientView from '@/views/RegisterClientView';
export const metadata: Metadata = {
    title: 'Register new client',
    description: 'Dashboard page',
}

const RegisterClientPage: React.FC = () => {
    return (
        <div>
            <RegisterClientView />
        </div>

    );
};

export default RegisterClientPage;
