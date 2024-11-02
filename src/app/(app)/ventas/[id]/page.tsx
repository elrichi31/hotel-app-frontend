import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import EditVenta from './EditVenta';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editar venta',
  description: 'Editar venta',
}

export default async function Page({ params }: any) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token?.token || '';

  return (
    <EditVenta params={params} token={token} />
  );
}
