"use client";
import React, { useState } from 'react';
import { Input, Button } from '@heroui/react';
import { ResultState } from '@/components/ui/ResultState';
import { toast } from '@/lib/toast';

export default function RequestResetPage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);

  const handleRequestReset = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success('Link de reseteo enviado. Revisa tu correo electrónico.');
        setResetSent(true); // Cambia el estado para mostrar el resultado
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al solicitar el reseteo.');
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {!resetSent ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h1 className="text-2xl mb-4">Solicitud de Reseteo de Contraseña</h1>
          <Input
            placeholder="Ingrese su correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Button
            color="primary"
            onPress={handleRequestReset}
            isLoading={loading}
            className="w-full"
          >
            Enviar Enlace de Reseteo
          </Button>
        </div>
      ) : (
        <ResultState
          status="success"
          title="Solicitud Enviada Exitosamente"
          subTitle="Hemos enviado un enlace de reseteo de contraseña a su correo electrónico. Por favor, revise su bandeja de entrada."
          extra={
            <Button color="primary" onPress={() => setResetSent(false)}>
              Volver
            </Button>
          }
        />
      )}
    </div>
  );
}
