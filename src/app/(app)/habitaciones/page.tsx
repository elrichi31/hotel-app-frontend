import React from 'react'
import { Metadata } from 'next'
import RoomsPage from './roomPage'

export const metadata: Metadata = {
    title: 'Habitaciones',
    description: 'Página de habitaciones',
}

export default function Page() {
  return (
    <div>
        <RoomsPage />
    </div>
  )
}
