"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryToken = searchParams.get('token');
      if (queryToken) {
        setToken(queryToken);
      } else {
        message.error('Token inválido o no proporcionado.');
        router.push('/request-reset');
      }
    }
  }, [searchParams, router]);  

  const handleResetPassword = async () => {
    if (!token) {
      return;
    }

    if (password !== confirmPassword) {
      message.error('Las contraseñas no coinciden.');
      return;
    }

    const body = {
      token,
      new_password: password,
    };

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        message.success('Contraseña restablecida con éxito.');
        router.push('/login');
      } else {
        const data = await res.json();
        message.error(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      message.error('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl mb-4">Restablecer Contraseña</h1>
        <Input.Password
          placeholder="Ingrese su nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Input.Password
          placeholder="Confirme su nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4"
        />
        <Button
          type="primary"
          onClick={handleResetPassword}
          loading={loading}
          className="w-full"
        >
          Restablecer Contraseña
        </Button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
