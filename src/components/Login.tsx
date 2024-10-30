"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Form, Input, message, Spin } from 'antd';
import type { FormProps } from 'antd';
import { signIn, useSession } from 'next-auth/react';

type FieldType = {
  username: string;
  password: string;
  remember: boolean;
};

const Login: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  // Redirigir al usuario si ya está autenticado
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setLoading(true); // Inicia la carga
    const responseNextAuth = await signIn('credentials', {
      redirect: false,
      ...values,
    });

    if (responseNextAuth?.error) {
      message.error(`Inicio de sesión fallido: ${responseNextAuth.error}`);
      setLoading(false); // Finaliza la carga en caso de error
      return;
    }

    message.success('Inicio de sesión exitoso');
    router.push('/dashboard');
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Login failed');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Ingrese su nombre de usuario!' }]}
            className="mb-4"
          >
            <Input className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Ingrese su contraseña' }]}
            className="mb-4"
          >
            <Input.Password className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <a href="/request-reset" className="block text-blue-500 text-sm mb-4">
            Olvidaste tu contraseña
          </a>

          <Form.Item className="mb-0 text-center">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? <Spin /> : 'Inicia sesión'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
