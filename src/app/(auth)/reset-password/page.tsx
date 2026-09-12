"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Input, Button } from '@heroui/react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from '@/lib/toast';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryToken = searchParams.get('token');
      if (queryToken) {
        setToken(queryToken);
      } else {
        toast.error('Token inválido o no proporcionado.');
        router.push('/request-reset');
      }
    }
  }, [searchParams, router]);  

  const handleResetPassword = async () => {
    if (!token) {
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
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
        toast.success('Contraseña restablecida con éxito.');
        router.push('/login');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al restablecer la contraseña.');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl mb-4">Restablecer Contraseña</h1>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Ingrese su nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
          endContent={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-default-400">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirme su nueva contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4"
          endContent={
            <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-default-400">
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <Button
          color="primary"
          onPress={handleResetPassword}
          isLoading={loading}
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
