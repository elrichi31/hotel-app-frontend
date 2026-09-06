"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button, Form, Input, message } from 'antd';
import { User, Lock, Home } from 'lucide-react';
import { notion, viz } from '@/lib/theme';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: notion.pageBg }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: 380 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${viz.series1}1f`,
              color: viz.series1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 20,
            }}
          >
            <Home size={20} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, color: notion.ink, margin: 0 }}>Inicia sesión en tu cuenta</h1>
          <p style={{ fontSize: 14, color: notion.inkMuted, marginTop: 6, marginBottom: 28 }}>
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical" autoComplete="off">
            <Form.Item
              label="Nombre de usuario"
              name="username"
              rules={[{ required: true, message: 'Por favor ingresa tu nombre de usuario' }]}
            >
              <Input prefix={<User size={14} color={notion.inkFaint} />} placeholder="Ingresa tu nombre de usuario" size="large" />
            </Form.Item>
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
              style={{ marginBottom: 8 }}
            >
              <Input.Password prefix={<Lock size={14} color={notion.inkFaint} />} placeholder="Ingresa tu contraseña" size="large" />
            </Form.Item>
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <a href="/request-reset" style={{ fontSize: 13, color: viz.series1 }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                Iniciar sesión
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Panel de marca: solo en pantallas grandes, mismo fondo que el sidebar */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: notion.sidebarBg,
          borderLeft: `1px solid ${notion.divider}`,
        }}
        className="hidden lg:flex"
      >
        <div style={{ textAlign: 'center', padding: '0 64px', maxWidth: 640 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: notion.ink, marginBottom: 16, lineHeight: 1.15 }}>
            Bienvenido a HotelApp
          </h2>
          <p style={{ fontSize: 16, color: notion.inkMuted, lineHeight: 1.6 }}>
            Experimenta la nueva generación en gestión hotelera. Reserva, administra y disfruta de tu estadía con facilidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
