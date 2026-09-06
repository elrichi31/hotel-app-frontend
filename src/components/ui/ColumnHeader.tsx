"use client";
import React from 'react';
import { notion } from '@/lib/theme';

/** Título de columna con un ícono atenuado delante, para escanear la tabla de un vistazo. */
export function ColumnHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: notion.inkFaint, fontSize: 13, display: 'inline-flex' }}>{icon}</span>
      {children}
    </span>
  );
}
