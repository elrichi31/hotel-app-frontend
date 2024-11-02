import React from 'react'
import { Metadata } from 'next'
import RoomsPage from './RoomPage'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const metadata: Metadata = {
    title: 'Habitaciones',
    description: 'Página de habitaciones',
}

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.token.token) {
    return <p>Debes iniciar sesión para acceder a esta página.</p>;
  }

  return <RoomsPage token={session.user.token.token} />;
};

export default Page;
