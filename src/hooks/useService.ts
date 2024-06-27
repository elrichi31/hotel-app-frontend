import { useState } from 'react';
import axios from '../lib/axios';
import { message } from 'antd';

export const useService = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const registerClient = async (clientData: any) => {
        setLoading(true);
        setErrors({});

        try {
            await axios.post('/register-client', clientData);
            message.success('Client registered successfully');
            setLoading(false);
            return true;
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                message.error('Failed to register client');
            }
            setLoading(false);
            return false;
        }
    };

    return {
        loading,
        errors,
        registerClient,
    };
};
