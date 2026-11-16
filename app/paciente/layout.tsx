"use client";

import Link from "next/link";
import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconShield, IconUser } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

/**
 * Guard simulado de la vista de paciente. No constituye seguridad real:
 * cuando exista autenticación, la protección debe resolverse en el servidor
 * (proxy.ts) con la sesión del backend.
 */
export default function PacienteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { rol, setRol, isReady } = useRole();

  if (!isReady) {
    return (
      <div className="space-y-4 py-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  if (rol !== "paciente") {
    return (
      <div className="flex min-h-[55vh] items-center justify-center py-10">
        <Card className="w-full max-w-lg p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <IconShield className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
            Acceso restringido
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Esta sección muestra la información personal del paciente. Activa
            la vista de paciente para consultar recetas y disponibilidad de
            medicamentos.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => setRol("paciente")}>
              <IconUser className="h-4 w-4" />
              Activar vista paciente
            </Button>
            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Ir al panel de farmacia
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Cambio de rol simulado. No sustituye la autenticación real.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
