import { parseDate, parseDateTime, CalendarDate, CalendarDateTime } from '@internationalized/date';

/**
 * Los DatePicker/DateRangePicker de HeroUI trabajan con `CalendarDate` de
 * @internationalized/date, no con strings. El resto de la app (react-hook-form,
 * zod, el backend) usa fechas ISO 'YYYY-MM-DD' planas, así que estos helpers
 * convierten en la frontera del campo en vez de propagar `CalendarDate` al
 * estado del formulario.
 */
export function toCalendarDate(iso?: string | null): CalendarDate | null {
  if (!iso) return null;
  try {
    return parseDate(iso);
  } catch {
    return null;
  }
}

export function fromCalendarDate(date: CalendarDate | null): string {
  return date ? date.toString() : '';
}

/** Igual que `toCalendarDate`/`fromCalendarDate` pero con hora, para campos con `showTime`. */
export function toCalendarDateTime(iso?: string | null): CalendarDateTime | null {
  if (!iso) return null;
  try {
    return parseDateTime(iso.length === 16 ? iso : iso.slice(0, 16));
  } catch {
    return null;
  }
}

export function fromCalendarDateTime(date: CalendarDateTime | null): string {
  return date ? date.toString().slice(0, 16) : '';
}
