"use client";
import React from 'react';
import { Input, Tabs, Tab, DateRangePicker } from '@heroui/react';
import { Search } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { notion } from '@/lib/theme';
import { toCalendarDate, fromCalendarDate } from '@/lib/dateField';
import type { ActiveFilter } from '@/components/ui/ActiveFilters';

export type Period = 'todas' | 'hoy' | 'ayer' | '7dias' | 'mes';

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'Todas', value: 'todas' },
  { label: 'Hoy', value: 'hoy' },
  { label: 'Ayer', value: 'ayer' },
  { label: '7 días', value: '7dias' },
  { label: 'Mes', value: 'mes' },
];

const PERIOD_LABEL: Record<Period, string> = Object.fromEntries(
  PERIOD_OPTIONS.map((o) => [o.value, o.label])
) as Record<Period, string>;

/**
 * Deriva los chips de "búsqueda / periodo / rango de fechas" a partir del
 * mismo estado controlado que ya recibe `TableToolbar` — así cada página que
 * usa el toolbar no repite esta lógica para armar sus chips de filtros activos.
 */
export function useToolbarFilterChips({
  search,
  onSearch,
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  period: Period;
  onPeriodChange: (p: Period) => void;
  dateRange: [Dayjs, Dayjs] | null;
  onDateRangeChange: (r: [Dayjs, Dayjs] | null) => void;
}): ActiveFilter[] {
  const chips: ActiveFilter[] = [];
  if (search.trim()) {
    chips.push({ key: 'search', label: `“${search.trim()}”`, onClear: () => onSearch('') });
  }
  if (period !== 'todas') {
    chips.push({ key: 'period', label: PERIOD_LABEL[period], onClear: () => onPeriodChange('todas') });
  }
  if (dateRange) {
    chips.push({
      key: 'dateRange',
      label: `${dateRange[0].format('DD/MM/YYYY')} – ${dateRange[1].format('DD/MM/YYYY')}`,
      onClear: () => onDateRangeChange(null),
    });
  }
  return chips;
}

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
        <Tabs
          selectedKey={period}
          onSelectionChange={(key) => onPeriodChange(key as Period)}
          size="sm"
          variant="solid"
          color="primary"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <Tab key={opt.value} title={opt.label} />
          ))}
        </Tabs>
        <DateRangePicker
          aria-label="Rango de fechas"
          value={dateRange ? { start: toCalendarDate(dateRange[0].format('YYYY-MM-DD'))!, end: toCalendarDate(dateRange[1].format('YYYY-MM-DD'))! } : null}
          onChange={(range) => {
            if (!range?.start || !range?.end) {
              onDateRangeChange(null);
              return;
            }
            onDateRangeChange([dayjs(fromCalendarDate(range.start)), dayjs(fromCalendarDate(range.end))]);
          }}
          className="w-64"
        />
      </div>
      <Input
        isClearable
        startContent={<Search size={14} color={notion.inkFaint} />}
        placeholder={searchPlaceholder}
        value={search}
        onValueChange={onSearch}
        className="max-w-xs"
      />
    </div>
  );
}
