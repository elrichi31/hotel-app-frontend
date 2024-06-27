import React from 'react';
import RegisterClientForm from '@/components/RegisterClientForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register new client',
    description: 'Dashboard page',
  }
const RegisterClientPage: React.FC = () => {
    return (
        <div>
            <RegisterClientForm />

        </div>
        
    );
};

export default RegisterClientPage;
