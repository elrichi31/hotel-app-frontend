"use client";
import React from 'react';
import { Chip, Button } from '@heroui/react';
import { notion } from '@/lib/theme';

export interface ActiveFilter {
  key: string;
  label: string;
  onClear: () => void;
}

/**
 * Chips de filtros aplicados, arriba de la tabla: cada filtro activo (búsqueda,
 * periodo, rango de fechas, selects de estado/rol/tipo...) se resume en un chip
 * cerrable, para que se note de un vistazo que la lista está filtrada y no que
 * "no hay más datos". Con 2+ filtros aparece un "Limpiar todo".
 */
export function ActiveFilters({ filters }: { filters: ActiveFilter[] }) {
  if (filters.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontSize: 12, color: notion.inkFaint }}>Filtros:</span>
      {filters.map((f) => (
        <Chip key={f.key} size="sm" variant="flat" color="primary" onClose={f.onClear}>
          {f.label}
        </Chip>
      ))}
      {filters.length > 1 && (
        <Button size="sm" variant="light" onPress={() => filters.forEach((f) => f.onClear())}>
          Limpiar todo
        </Button>
      )}
    </div>
  );
}
