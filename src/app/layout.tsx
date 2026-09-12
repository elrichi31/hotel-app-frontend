import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionAuthProvider from "./context/SessionAuthProvider";
import ThemeProvider from "./context/ThemeProvider";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HotelApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <SessionAuthProvider>
        <body className={inter.className}>
          <AntdRegistry>
            <ThemeProvider>{children}</ThemeProvider>
          </AntdRegistry>
          <Toaster theme="dark" position="top-right" richColors />
        </body>
      </SessionAuthProvider>
    </html>
  );
}
