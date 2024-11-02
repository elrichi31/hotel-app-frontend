import React from 'react'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Metadata } from 'next';
import UsuariosPage from './UsuariosPage';

export const metadata: Metadata = {
  title: 'Panel de usuarios',
  description: 'panel de usuarios',
}

export default async function Page() {
  const session = await getServerSession(authOptions);
    const token = session?.user?.token?.token || '';
    const role = session?.user?.user.role || '';
  return (
    <UsuariosPage token={token} role={role} />
  )
}
