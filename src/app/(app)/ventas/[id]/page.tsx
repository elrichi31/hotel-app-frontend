"use client"
import React, { useEffect, useState } from 'react';
import ClientForm from '@/components/ClientForm';
import { useSession } from 'next-auth/react';
import VentasService from '@/services/VentasService';
import VentaForm from '@/components/VentaForm';

export default function Page({ params }: any) {
  const { data: session } = useSession();
  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientIds, setClientIds] = useState<number[]>([]);


  useEffect(() => {
    if (session?.user?.token?.token) {
      const fetchVenta = async () => {
        try {
          const ventaData = await VentasService.getVenta(params.id, session.user.token.token);
          setVenta(ventaData);
          console.log('Venta:', ventaData);
          setLoading(false);
        } catch (error) {
          setError('Error al obtener la venta');
          setLoading(false);
        }
      }
      fetchVenta();
    }
  }, [session, params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const updateClientIds = (newClientIds: number[]) => {
    setClientIds(newClientIds);
};

  return (
    <div>
      <h1 className='text-xl mb-3'>Editar venta {params.id}</h1>
      <ClientForm personas={venta.personas} updateClientIds={updateClientIds} />
      <VentaForm initialVenta={venta} personIds={clientIds} idVenta={params.id} />
    </div>
  );
}
