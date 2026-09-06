"use client";
import React from 'react';
import { notion } from '@/lib/theme';

/** Encabezado de página: título, subtítulo con la conclusión y acción principal. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 18,
      }}
    >
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: notion.ink, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ color: notion.inkMuted, marginTop: 4, marginBottom: 0, fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
