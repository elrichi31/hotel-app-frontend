"use client"
import React, { useEffect, useState } from 'react';
import { Spinner } from '@heroui/react';
import ClientForm from '@/components/ClientForm';
import VentasService from '@/services/VentasService';
import VentaForm from '@/components/VentaForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { notion } from '@/lib/theme';
import type { Client } from '@/types/types';

export default function EditVenta({ params, token }: any) {
  const [venta, setVenta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (token) {
      const fetchVenta = async () => {
        try {
          const ventaData = await VentasService.getVenta(params.id, token);
          setVenta(ventaData);
          setClients(ventaData.personas ?? []);
          setLoading(false);
        } catch (error) {
          setError('Error al obtener la venta');
          setLoading(false);
        }
      }
      fetchVenta();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div style={{ color: notion.red }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageHeader title={`Editar venta #${params.id}`} />
      <ClientForm clients={clients} onChange={setClients} token={token} />
      <VentaForm initialVenta={venta} personIds={clients.map((c) => c.id)} idVenta={params.id} token={token} />
    </div>
  );
}
