"use client";

import { ConfigProvider, theme } from "antd";
import { antdTheme } from "@/lib/theme";

/**
 * Aplica el tema oscuro de antd. Vive en un componente de cliente a propósito:
 * `darkAlgorithm` es código de antd en tiempo de ejecución, y el layout raíz es
 * un Server Component, así que importarlo allí rompe el manifiesto de RSC.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={{ ...antdTheme, algorithm: theme.darkAlgorithm }}>
      {children}
    </ConfigProvider>
  );
}
