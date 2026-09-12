"use client";
import React from 'react';
import { Pagination } from '@heroui/react';
import { notion } from '@/lib/theme';
import { PageSizeSelect } from '@/components/ui/PageSizeSelect';

export interface PaginationState {
  current: number;
  pageSize: number;
}

/** Reemplaza el `pagination` embebido en `Table` de antd: total + tamaño de página + control de páginas. */
export function TablePagination({
  totalItems,
  itemLabel = 'elementos',
  pagination,
  onChange,
  pageSizeOptions,
}: {
  totalItems: number;
  itemLabel?: string;
  pagination: PaginationState;
  onChange: (next: PaginationState) => void;
  pageSizeOptions?: number[];
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 4px', flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 13, color: notion.inkMuted }}>
        {totalItems} {itemLabel}
        <PageSizeSelect
          value={pagination.pageSize}
          options={pageSizeOptions}
          onChange={(pageSize) => onChange({ current: 1, pageSize })}
        />
      </span>
      <Pagination
        total={totalPages}
        page={pagination.current}
        onChange={(current) => onChange({ ...pagination, current })}
        size="sm"
        showControls
      />
    </div>
  );
}

/** Recorta `rows` a la página actual — HeroUI Table no pagina el dataSource por sí solo. */
export function paginate<T>(rows: T[], pagination: PaginationState): T[] {
  const start = (pagination.current - 1) * pagination.pageSize;
  return rows.slice(start, start + pagination.pageSize);
}
