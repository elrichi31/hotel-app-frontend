import { viz } from '@/lib/theme'

export type EstadoFactura = 'guardado' | 'emitido' | 'anulado'

/** Mismo mapeo que usa la tabla de Facturas: reutiliza la paleta ya validada. */
export const facturaEstadoColor: Record<EstadoFactura, string> = {
  guardado: viz.neutral,
  emitido: viz.positive,
  anulado: viz.negative,
}

export const facturaEstadoLabel: Record<EstadoFactura, string> = {
  guardado: 'Guardado',
  emitido: 'Emitido',
  anulado: 'Anulado',
}
