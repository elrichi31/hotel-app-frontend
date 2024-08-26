// app/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import FacturasService from '@/services/FacturasService';
import { useSession } from 'next-auth/react';
import CardFactura from '@/components/FacturaCard';

export default function Page({ params }: any) {
  const { data: session } = useSession();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        if (session?.user?.token.token) {
          const data = await FacturasService.getFacturasByVenta(params.id, session.user.token.token);
          setFacturas(data);
        }
      } catch (error: any) {
        setError(error.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [params.id, session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Facturas para Venta {params.id}</h1>
      {facturas.length > 0 ? (
        <div>
          {facturas.map((factura) => (
            <CardFactura key={factura.id} factura={factura} />
          ))}
        </div>
      ) : (
        <p>No hay facturas para esta venta.</p>
      )}
    </div>
  );
}
