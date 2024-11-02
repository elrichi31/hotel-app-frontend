// src/app/(app)/ventas/page.tsx
import React from 'react';
import VentasPage from './VentasPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Panel de ventas',
    description: 'panel de ventas',
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token?.token || '';

  return <VentasPage token={token} />;
}
