"use client";
import React from 'react';
import { Input, Segmented, DatePicker } from 'antd';
import { Search } from 'lucide-react';
import type { Dayjs } from 'dayjs';
import { notion } from '@/lib/theme';

const { RangePicker } = DatePicker;

export type Period = 'todas' | 'hoy' | 'ayer' | '7dias' | 'mes';

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Hoy', value: 'hoy' },
  { label: 'Ayer', value: 'ayer' },
  { label: '7 días', value: '7dias' },
  { label: 'Mes', value: 'mes' },
];

/**
 * Barra de filtros para las tablas de registros: búsqueda + periodo rápido +
 * rango de fechas, todos combinables y aplicados al instante (sin botón
 * "Aplicar filtro" — cada cambio filtra de inmediato).
 */
export function TableToolbar({
  search,
  onSearch,
  searchPlaceholder = 'Buscar...',
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
  dateRange: [Dayjs, Dayjs] | null;
  onDateRangeChange: (r: [Dayjs, Dayjs] | null) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        marginBottom: 14,
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Segmented value={period} onChange={(v) => onPeriodChange(v as Period)} options={PERIOD_OPTIONS} />
        <RangePicker
          format="DD/MM/YYYY"
          value={dateRange as any}
          onChange={(dates) => onDateRangeChange(dates as [Dayjs, Dayjs] | null)}
        />
      </div>
      <Input
        allowClear
        prefix={<Search size={14} color={notion.inkFaint} />}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{ maxWidth: 320 }}
      />
    </div>
  );
}
