import React from 'react'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';
import ImprimirFactura from './ImprimirFactura';

export const metadata: Metadata = {
  title: 'Imprimir factura',
  description: 'Vista imprimible de la factura',
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  const token = session?.user?.token?.token || '';
  return (
    <ImprimirFactura token={token} id={params.id} />
  )
}
