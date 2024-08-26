"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Form, Input, message, Spin } from 'antd';
import type { FormProps } from 'antd';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
type FieldType = {
  username: string;
  password: string;
  remember: boolean;
};

const Login: React.FC = () => {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  if (session) {
    router.push('/dashboard');
  }
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setLoading(true); // Inicia la carga
    const responseNextAuth = await signIn('credentials', { 
      redirect: false, ...values 
    });
    if(responseNextAuth?.error){
      setErrors(responseNextAuth.error.split(','));
      message.error('Login failed');
      setLoading(false); // Finaliza la carga en caso de error
      return;
    }
    message.success('Login successful');
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
            rules={[{ required: true, message: 'Please input your username!' }]}
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

          <Form.Item name="remember" valuePropName="checked" className="mb-4">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

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
