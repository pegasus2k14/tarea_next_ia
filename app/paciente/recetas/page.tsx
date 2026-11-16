"use client";

import { useState } from "react";
import { useRole } from "@/components/providers/role-provider";
import { RecetaCard } from "@/components/recetas/receta-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconClipboard } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { ESTADO_RECETA_LABEL, ESTADOS_RECETA } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@/services";
import type { EstadoReceta } from "@/types";

type Filtro = "todas" | EstadoReceta;

const FILTROS: Filtro[] = ["todas", ...ESTADOS_RECETA];

export default function MisRecetasPage() {
  const { usuario } = useRole();
  const recetasQ = useAsync(
    () => api.recetas.listarPorUsuario(usuario.id, { limit: 100 }),
    [usuario.id],
  );
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const recetas = recetasQ.data?.items ?? [];
  const filtradas =
    filtro === "todas"
      ? recetas
      : recetas.filter((receta) => receta.estado === filtro);

  function contar(estado: Filtro): number {
    return estado === "todas"
      ? recetas.length
      : recetas.filter((receta) => receta.estado === estado).length;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis recetas"
        description={
          recetasQ.loading
            ? "Consultando tu historial de recetas…"
            : `${recetas.length} recetas registradas en tu expediente.`
        }
      />

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card">
        {FILTROS.map((opcion) => {
          const activo = filtro === opcion;
          const label =
            opcion === "todas" ? "Todas" : ESTADO_RECETA_LABEL[opcion];
          return (
            <button
              key={opcion}
              type="button"
              onClick={() => setFiltro(opcion)}
              aria-pressed={activo}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                activo
                  ? "bg-brand-50 text-brand-800"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              {label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  activo
                    ? "bg-brand-100 text-brand-800"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {recetasQ.loading ? "·" : contar(opcion)}
              </span>
            </button>
          );
        })}
      </div>

      {recetasQ.loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : recetasQ.error ? (
        <ErrorState message={recetasQ.error.message} onRetry={recetasQ.reload} />
      ) : filtradas.length === 0 ? (
        <EmptyState
          icon={<IconClipboard className="h-5 w-5" />}
          title={
            recetas.length === 0
              ? "Aún no tienes recetas"
              : "No hay recetas con este estado"
          }
          description={
            recetas.length === 0
              ? "Cuando tu médico registre una prescripción, podrás consultarla aquí."
              : "Cambia el filtro para revisar otras recetas de tu historial."
          }
        />
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2">
          {filtradas.map((receta) => (
            <RecetaCard key={receta.id} receta={receta} />
          ))}
        </div>
      )}
    </div>
  );
}
