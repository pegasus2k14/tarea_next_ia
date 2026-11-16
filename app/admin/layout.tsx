"use client";

import Link from "next/link";
import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconShield, IconStethoscope } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { rol, setRol, isReady } = useRole();

  if (!isReady) {
    return (
      <div className="space-y-4 py-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  if (rol !== "farmaceutico") {
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
            Esta sección está reservada para el personal farmacéutico. Puedes
            activar la vista de demostración para revisar el inventario y las
            recetas.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => setRol("farmaceutico")}>
              <IconStethoscope className="h-4 w-4" />
              Activar vista farmacéutico
            </Button>
            <Link
              href="/paciente"
              className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Volver a vista paciente
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
