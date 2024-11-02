import React from 'react'
import FacturasPage from './FacturasPage'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de facturas',
  description: 'panel de facturas',
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token?.token || '';
  return (
    <FacturasPage token={token}/>
  )
}
