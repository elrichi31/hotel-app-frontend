"use client";
import React from 'react';
import { notion } from '@/lib/theme';

/** Tarjeta de sección: agrupa un bloque de un formulario o panel, como en el resto de la app. */
export function Section({ title, extra, children }: { title: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: notion.cardBg,
        border: `1px solid ${notion.divider}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: notion.ink }}>{title}</div>
        {extra}
      </div>
      {children}
    </div>
  );
}
