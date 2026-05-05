import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Genesis | ERP de Élite",
  description: "Sincronía perfecta para empresas de alto rendimiento.",
};

import { SettingsProvider } from "@/components/SettingsProvider";
import { SidebarProvider } from "@/components/SidebarProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SettingsProvider>
          <SidebarProvider>
            {children}
            <Toaster position="bottom-right" />
          </SidebarProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
