import React from 'react'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';
import FacturasVenta from './FacturasVenta';

export const metadata: Metadata = {
  title: 'Facturas de venta',
  description: 'Facturas de venta',
}

export default async function Page({ params }: any) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token?.token || '';
  return (
    <FacturasVenta token={token} params={params}/>
  )
}
