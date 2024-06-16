"use client";
import React from 'react';
import { Layout, Button, Typography } from 'antd';
import { useRouter } from 'next/navigation';

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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Title>Welcome to Our Application</Title>
          <Paragraph>
            Please login or register to continue.
          </Paragraph>
          <div>
            <Button type="primary" size="large" onClick={navigateToLogin} style={{ marginRight: 20 }}>
              Login
            </Button>
            <Button type="default" size="large" onClick={navigateToRegister}>
              Register
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default WelcomePage;
