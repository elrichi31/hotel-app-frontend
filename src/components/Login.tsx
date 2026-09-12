"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button, Input } from '@heroui/react';
import { z } from 'zod';
import { User, Lock, Home, Eye, EyeOff } from 'lucide-react';
import { notion, viz } from '@/lib/theme';
import { toast } from '@/lib/toast';
import { useZodForm } from '@/lib/useZodForm';
import { FormField } from '@/components/ui/FormField';

const loginSchema = z.object({
  username: z.string().min(1, 'Por favor ingresa tu nombre de usuario'),
  password: z.string().min(1, 'Por favor ingresa tu contraseña'),
});

const Login: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();
  const { control, handleSubmit } = useZodForm(loginSchema, {
    defaultValues: { username: '', password: '' },
  });

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
      toast.error(`Inicio de sesión fallido: ${responseNextAuth.error}`);
      setLoading(false);
      return;
    }

    toast.success('Inicio de sesión exitoso');
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

          <form onSubmit={handleSubmit(onFinish)} noValidate autoComplete="off">
            <FormField
              control={control}
              name="username"
              render={(field) => (
                <Input
                  {...field}
                  label="Nombre de usuario"
                  startContent={<User size={14} color={notion.inkFaint} />}
                  placeholder="Ingresa tu nombre de usuario"
                  size="lg"
                  className="mb-4"
                />
              )}
            />
            <FormField
              control={control}
              name="password"
              render={(field) => (
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  startContent={<Lock size={14} color={notion.inkFaint} />}
                  endContent={
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-default-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  placeholder="Ingresa tu contraseña"
                  size="lg"
                  className="mb-2"
                />
              )}
            />
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <a href="/request-reset" style={{ fontSize: 13, color: viz.series1 }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Button type="submit" color="primary" size="lg" fullWidth isLoading={loading}>
              Iniciar sesión
            </Button>
          </form>
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
