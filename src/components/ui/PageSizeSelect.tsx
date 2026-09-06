"use client";
import React from 'react';
import { Select } from 'antd';
import { notion } from '@/lib/theme';

/**
 * Reemplaza el selector de tamaño de página de antd: el que trae Pagination
 * por defecto usa showSearch=true y termina pareciendo un buscador. Este es
 * un Select normal (sin búsqueda) con las opciones fijas.
 */
export function PageSizeSelect({
  value,
  onChange,
  options = [10, 30, 50],
}: {
  value: number;
  onChange: (v: number) => void;
  options?: number[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: notion.inkMuted }}>Mostrar</span>
      <Select
        size="small"
        value={value}
        onChange={onChange}
        options={options.map((n) => ({ value: n, label: `${n} / página` }))}
        style={{ width: 110 }}
      />
    </div>
  );
}
