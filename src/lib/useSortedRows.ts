import { useMemo, useState } from 'react';
import type { SortDescriptor } from '@react-types/shared';

/**
 * Reemplaza el `sorter` por columna de antd: HeroUI's `Table` solo dibuja la
 * flecha de orden, no ordena — el comparador real sigue viviendo en la
 * página, igual que antes.
 */
export function useSortedRows<T>(
  rows: T[],
  comparators: Record<string, (a: T, b: T) => number>,
  initial?: SortDescriptor
) {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(initial);

  const sorted = useMemo(() => {
    if (!sortDescriptor) return rows;
    const comparator = comparators[String(sortDescriptor.column)];
    if (!comparator) return rows;
    const factor = sortDescriptor.direction === 'descending' ? -1 : 1;
    return [...rows].sort((a, b) => comparator(a, b) * factor);
  }, [rows, sortDescriptor, comparators]);

  return { sorted, sortDescriptor, setSortDescriptor };
}
