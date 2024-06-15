"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Form, Input, message } from 'antd';
import type { FormProps } from 'antd';
import { useAuth } from '../hooks/useAuth';

type FieldType = {
  username: string;
  password: string;
  remember: boolean;
};

const Login: React.FC = () => {
  const router = useRouter();
  const { login, user } = useAuth({ middleware: 'guest', redirectIfAuthenticated: '/' });
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState('');
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      await login({ setErrors, setStatus, ...values });
      message.success('Login successful');
    } catch (error) {
      console.error('Error logging in:', error);
      message.error('Login failed');
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
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
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
            className="mb-4"
          >
            <Input className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            className="mb-4"
          >
            <Input.Password className="border rounded py-2 px-4 w-full" />
          </Form.Item>

          <Form.Item<FieldType>
            name="remember"
            valuePropName="checked"
            className="mb-4"
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item className="mb-0 text-center">
            <Button type="primary" htmlType="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
