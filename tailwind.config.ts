import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import { notion } from "./src/lib/theme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    heroui({
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            background: notion.pageBg,
            foreground: notion.ink,
            content1: notion.cardBg,
            content2: notion.sidebarBg,
            content3: "#1c1c1c",
            content4: "#232323",
            divider: notion.divider,
            focus: notion.blue,
            default: {
              50: "#141414",
              100: "#1c1c1c",
              200: notion.track,
              300: "#2e2e2e",
              400: "#3a3a3a",
              500: notion.inkFaint,
              600: notion.inkMuted,
              700: notion.ink,
              foreground: notion.ink,
              DEFAULT: notion.track,
            },
            primary: {
              DEFAULT: notion.blue,
              foreground: "#ffffff",
            },
            danger: {
              DEFAULT: notion.red,
              foreground: "#ffffff",
            },
            success: {
              DEFAULT: "#19a478",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};
export default config;
