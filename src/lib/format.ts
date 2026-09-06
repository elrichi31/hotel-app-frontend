import dayjs from 'dayjs'

/**
 * `decimals = 0` para tarifas redondas (habitaciones, panel); `2` para
 * montos de transacciones (ventas, facturas, reservas) que pueden traer centavos.
 */
export const money = (n: number | string, decimals = 0) =>
  '$' +
  new Intl.NumberFormat('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(n))

export const shortDate = (d: string | Date) => dayjs(d).format('DD/MM/YYYY')
export const dateTime = (d: string | Date) => dayjs(d).format('DD/MM/YYYY HH:mm')
