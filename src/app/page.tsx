"use client";
import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import ButtonAuth from '@/components/ButtonAuth';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const WelcomePage: React.FC = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/login');
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
      <Content style={{ textAlign: 'center' }}>
        <ButtonAuth />
      </Content>
    </Layout>
  );
};

export default WelcomePage;
