"use client";

import { ConfigProvider, theme } from "antd";
import { HeroUIProvider } from "@heroui/react";
import { antdTheme } from "@/lib/theme";

/**
 * Aplica el tema oscuro tanto a HeroUI como a antd mientras coexisten durante
 * la migración. Vive en un componente de cliente a propósito: `darkAlgorithm`
 * y `HeroUIProvider` son código en tiempo de ejecución, y el layout raíz es un
 * Server Component, así que importarlos allí rompe el manifiesto de RSC.
 *
 * El ConfigProvider de antd se retira recién cuando la última pantalla que use
 * componentes antd se migre a HeroUI; hasta entonces ambos deben aplicar el
 * mismo tema oscuro ("notion") en paralelo.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ConfigProvider theme={{ ...antdTheme, algorithm: theme.darkAlgorithm }}>
        {children}
      </ConfigProvider>
    </HeroUIProvider>
  );
}
