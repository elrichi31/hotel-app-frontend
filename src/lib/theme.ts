import type { ThemeConfig } from 'antd'

/**
 * Paleta oscura tipo aplicación bancaria: superficies casi negras, tarjetas un
 * paso por encima y bordes de un blanco muy tenue en vez de líneas duras.
 */
export const notion = {
  // Superficies
  pageBg: '#0d0d0d',
  contentBg: '#0d0d0d',
  sidebarBg: '#131313',
  cardBg: '#141414',
  /** Fondo de las pistas vacías (barras de progreso, rieles). */
  track: '#232323',

  // Tinta
  ink: '#f2f2f0',
  inkMuted: 'rgba(242, 242, 240, 0.62)',
  inkFaint: 'rgba(242, 242, 240, 0.40)',

  // Interacción
  hover: 'rgba(255, 255, 255, 0.055)',
  active: 'rgba(255, 255, 255, 0.09)',
  divider: 'rgba(255, 255, 255, 0.08)',

  blue: '#3595e0',
  red: '#ef5f4f',

  radius: 8,
} as const

/**
 * Paleta de datos validada contra la superficie de tarjeta (#141414) en modo
 * oscuro con `validate_palette.js`: banda de luminosidad, piso de croma,
 * separación para daltonismo (ΔE 8.8 deutan, sobre el objetivo de 8),
 * piso de visión normal (ΔE 17.8) y contraste >= 3:1. Pasa tanto en pares
 * adyacentes (líneas, barras) como en todos los pares (dona).
 *
 * Tope de tres slots: un cuarto tono no logra separarse de los otros tres
 * cuando todos se ven a la vez. Con más de tres categorías se usa una lista
 * de barras, no color.
 */
export const viz = {
  series1: '#3595e0', // azul
  series2: '#19a478', // menta
  series3: '#ef5f4f', // coral

  /** Rampa ordinal de un solo tono (oscuro -> claro) para categorías ordenadas. */
  ramp: ['#1a4e86', '#256abf', '#3595e0', '#6da7ec'],

  /** Gris de las series en segundo plano: el énfasis va en un solo color. */
  muted: '#3a3a3a',
  /** Gris para trazos finos (línea de comparación): más claro que `muted`,
   *  que solo tiene cuerpo suficiente en rellenos grandes. */
  comparison: '#6a6a6a',

  grid: 'rgba(255, 255, 255, 0.07)',
  axisText: 'rgba(242, 242, 240, 0.40)',
  positive: '#19a478',
  negative: '#ef5f4f',
  /** Estado "pendiente / en borrador": el azul ya validado, no un color nuevo. */
  neutral: '#3595e0',
} as const

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: notion.blue,
    colorBgBase: notion.pageBg,
    colorBgContainer: notion.cardBg,
    colorBgElevated: '#1c1c1c',
    colorText: notion.ink,
    colorTextSecondary: notion.inkMuted,
    colorTextTertiary: notion.inkFaint,
    colorBorder: notion.divider,
    colorBorderSecondary: notion.divider,
    colorBgLayout: notion.pageBg,
    borderRadius: notion.radius,
    fontSize: 14,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35)',
    boxShadowSecondary: '0 1px 3px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35)',
  },
  components: {
    Menu: {
      // El menú vive dentro del sidebar: sin fondo propio ni barra activa
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemColor: notion.inkMuted,
      itemHoverColor: notion.ink,
      itemSelectedColor: notion.ink,
      itemHoverBg: notion.hover,
      itemSelectedBg: notion.active,
      itemActiveBg: notion.active,
      itemHeight: 30,
      itemBorderRadius: notion.radius,
      itemMarginInline: 8,
      itemMarginBlock: 1,
      itemPaddingInline: 8,
      iconSize: 16,
      collapsedIconSize: 18,
      iconMarginInlineEnd: 10,
      groupTitleColor: notion.inkFaint,
      groupTitleFontSize: 12,
      activeBarWidth: 0,
      activeBarBorderWidth: 0,
    },
    Layout: {
      siderBg: notion.sidebarBg,
      bodyBg: notion.pageBg,
      headerBg: notion.sidebarBg,
    },
    Card: {
      colorBgContainer: notion.cardBg,
      colorBorderSecondary: notion.divider,
    },
    Drawer: {
      paddingLG: 0,
      colorBgElevated: notion.sidebarBg,
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Segmented: {
      itemSelectedBg: '#2e2e2e',
      trackBg: '#1c1c1c',
      itemColor: notion.inkMuted,
      itemSelectedColor: notion.ink,
    },
    Tooltip: {
      colorBgSpotlight: '#2a2a2a',
    },
  },
}
