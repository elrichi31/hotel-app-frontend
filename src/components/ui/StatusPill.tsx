"use client";
import React from 'react';

/** Chip de estado con fondo tintado: mismo tratamiento que EstadoPill de facturas, ahora reutilizable. */
export function StatusPill({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        background: `${color}1f`,
        color,
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
      {label}
    </span>
  );
}
