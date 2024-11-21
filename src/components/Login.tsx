"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button, Form, Input, message, Divider, Spin } from 'antd';
import img from '../../public/img.webp'
import Image from 'next/image';
const Login: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  // Redirigir al usuario si ya está autenticado
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    const responseNextAuth = await signIn('credentials', {
      redirect: false,
      ...values,
    });

    if (responseNextAuth?.error) {
      message.error(`Inicio de sesión fallido: ${responseNextAuth.error}`);
      setLoading(false);
      return;
    }

    message.success('Inicio de sesión exitoso');
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[480px]">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold">Log in to your account</h1>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>
          <div className="flex flex-col gap-4">
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              autoComplete="off"
              className="space-y-4"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input placeholder="Enter your username"/>
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>
              <div className="flex items-center justify-between text-sm">
                <a href="/request-reset" className="text-blue-500 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                disabled={loading}
                className="bg-blue-500"
              >
                {loading ? <Spin /> : 'Sign in'}
              </Button>
            </Form>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-1 bg-white items-center justify-center">
        <div className="text-center px-12 py-16">
          <h2 className="text-[100px] font-bold mb-4">Welcome to HotelApp</h2>
          <p className="text-lg text-gray-600 mb-8">
            Experience the next generation of hotel management. Book, manage, and enjoy your stay with ease.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
