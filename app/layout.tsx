import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { RoleProvider } from "@/components/providers/role-provider";

export const metadata: Metadata = {
  title: {
    default: "MediGest · Gestión de medicamentos",
    template: "%s · MediGest",
  },
  description:
    "Sistema de gestión de medicamentos, inventario y recetas para pacientes y farmacéuticos.",
};

export const viewport: Viewport = {
  themeColor: "#106757",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col font-sans text-slate-900 antialiased">
        <RoleProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-8">
            {children}
          </main>
          <Footer />
        </RoleProvider>
      </body>
    </html>
  );
}
