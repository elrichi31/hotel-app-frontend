"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Input, message, Spin } from 'antd';
import type { FormProps } from 'antd';
import AuthService from '@/services/AuthService'; // Importa el servicio que creaste

type FieldType = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password?: string; // Este campo no se enviará a la API
};

const Register: React.FC = () => {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setLoading(true); // Inicia la carga
    try {
      // Llamada al servicio de registro
      const response = await AuthService.register({
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        setErrors(response.error.split(','));
        message.error('Registration failed');
        setLoading(false);
        return;
      }

      message.success('Registration successful');
      router.push('/login');
    } catch (error) {
      console.error('Error during registration:', error);
      message.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Registration failed');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
        <Form
          name="register"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
          
          <Form.Item
            label="First Name"
            name="first_name"
            rules={[{ required: true, message: 'Please input your first name!' }]}
            className="mb-4"
          >
            <Input className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: 'Please input your last name!' }]}
            className="mb-4"
          >
            <Input className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
            className="mb-4"
          >
            <Input className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
            className="mb-4"
          >
            <Input className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            className="mb-4"
          >
            <Input.Password className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
            className="mb-4"
          >
            <Input.Password className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item className="mb-0 text-center">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? <Spin /> : 'Register'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;
