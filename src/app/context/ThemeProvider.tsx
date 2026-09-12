"use client";

import { HeroUIProvider } from "@heroui/react";

/**
 * Aplica el tema oscuro de HeroUI. Vive en un componente de cliente a
 * propósito: `HeroUIProvider` es código en tiempo de ejecución, y el layout
 * raíz es un Server Component, así que importarlo allí rompe el manifiesto
 * de RSC.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
