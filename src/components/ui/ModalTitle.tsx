"use client";
import React from 'react';
import { notion, viz } from '@/lib/theme';

/** Título de modal con ícono en badge tintado: mismo tratamiento en toda la app. */
export function ModalTitle({
  icon,
  children,
  color = viz.series1,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: `${color}1f`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 16, fontWeight: 600, color: notion.ink }}>{children}</span>
    </div>
  );
}
