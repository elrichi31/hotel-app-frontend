"use client";
import React from 'react';
import { notion } from '@/lib/theme';

/** Punto de color + etiqueta: el estado nunca depende solo del color. */
export function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
      <span
        style={{ width: 7, height: 7, borderRadius: 4, background: color, flexShrink: 0 }}
      />
      <span style={{ color: notion.inkMuted }}>{label}</span>
    </span>
  );
}
