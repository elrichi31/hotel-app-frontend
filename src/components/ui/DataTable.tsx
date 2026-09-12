"use client";
import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from '@heroui/react';
import type { SortDescriptor } from '@react-types/shared';
import { notion } from '@/lib/theme';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  width?: number;
  allowsSorting?: boolean;
  render: (row: T) => React.ReactNode;
}

/**
 * Reemplaza `Table` de antd: HeroUI no pagina ni ordena el `dataSource` por
 * sí solo, así que este componente es puramente presentacional — la página
 * sigue siendo dueña del estado de orden/paginación/filtro, igual que antes
 * (los datos ya vienen filtrados y paginados en `rows`).
 */
export function DataTable<T extends { id: React.Key }>({
  columns,
  rows,
  isLoading,
  emptyContent = 'Sin resultados',
  sortDescriptor,
  onSortChange,
  bottomContent,
  ariaLabel,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyContent?: React.ReactNode;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => void;
  bottomContent?: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <Table
      aria-label={ariaLabel}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      bottomContent={bottomContent}
      classNames={{ wrapper: 'bg-content1 border border-divider', th: 'bg-transparent' }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align={column.align} allowsSorting={column.allowsSorting} width={column.width}>
            {column.header}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={rows}
        isLoading={isLoading}
        loadingContent={<Spinner size="sm" />}
        emptyContent={<span style={{ color: notion.inkFaint }}>{emptyContent}</span>}
      >
        {(row) => (
          <TableRow key={row.id}>
            {(columnKey) => (
              <TableCell>{columns.find((c) => c.key === columnKey)!.render(row)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
