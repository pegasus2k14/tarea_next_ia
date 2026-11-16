"use client";

import { useState } from "react";
import { useRole } from "@/components/providers/role-provider";
import { RecetaPacienteCard } from "@/components/recetas/receta-paciente-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconClipboard } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { ESTADO_RECETA_PACIENTE_LABEL } from "@/lib/constants";
import { estadoRecetaPaciente, type EstadoRecetaPaciente } from "@/lib/format";
import { cn } from "@/lib/utils";
import { api } from "@/services";

type Filtro = "todas" | EstadoRecetaPaciente;

const FILTROS: Filtro[] = ["todas", "activo", "completado", "cancelado"];

const FILTRO_LABEL: Record<Filtro, string> = {
  todas: "Todas",
  activo: "Activas",
  completado: "Completadas",
  cancelado: "Canceladas",
};

const PESO_ESTADO: Record<EstadoRecetaPaciente, number> = {
  activo: 0,
  completado: 1,
  cancelado: 2,
};

export default function MisRecetasPage() {
  const { usuario } = useRole();
  const recetasQ = useAsync(
    () => api.recetas.listarPorUsuario(usuario.id, { limit: 100 }),
    [usuario.id],
  );
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const recetas = [...(recetasQ.data?.items ?? [])].sort((a, b) => {
    const estadoA = estadoRecetaPaciente(a.estado);
    const estadoB = estadoRecetaPaciente(b.estado);
    if (PESO_ESTADO[estadoA] !== PESO_ESTADO[estadoB]) {
      return PESO_ESTADO[estadoA] - PESO_ESTADO[estadoB];
    }
    return b.fechaEmision.localeCompare(a.fechaEmision);
  });

  const activas = recetas.filter(
    (receta) => estadoRecetaPaciente(receta.estado) === "activo",
  ).length;

  const filtradas =
    filtro === "todas"
      ? recetas
      : recetas.filter(
          (receta) => estadoRecetaPaciente(receta.estado) === filtro,
        );

  function contar(opcion: Filtro): number {
    return opcion === "todas"
      ? recetas.length
      : recetas.filter(
          (receta) => estadoRecetaPaciente(receta.estado) === opcion,
        ).length;
  }

  const resumenActivas =
    activas === 1 ? "1 receta activa" : `${activas} recetas activas`;

  const vacio =
    recetas.length === 0
      ? {
          title: "Aún no tienes recetas",
          description:
            "Cuando tu médico registre una prescripción, podrás consultarla aquí con su dosis y frecuencia.",
        }
      : filtro === "activo"
        ? {
            title: "No tienes recetas activas",
            description:
              "Tu tratamiento está al día. Aquí aparecerán las nuevas prescripciones que emita tu médico.",
          }
        : filtro === "completado"
          ? {
              title: "Aún no hay recetas completadas",
              description:
                "Cuando surtas una receta en la farmacia, se moverá a tu historial de completadas.",
            }
          : {
              title: "No hay recetas en este estado",
              description: "Cambia el filtro para revisar otras recetas.",
            };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis recetas"
        description={
          recetasQ.loading
            ? "Consultando tu historial de recetas…"
            : `Tienes ${resumenActivas} de ${recetas.length} en tu expediente.`
        }
      />

      <div
        className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card"
        role="group"
        aria-label="Filtrar recetas por estado"
      >
        {FILTROS.map((opcion) => {
          const activo = filtro === opcion;
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
              {FILTRO_LABEL[opcion]}
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
          title={vacio.title}
          description={vacio.description}
        />
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2">
          {filtradas.map((receta) => (
            <RecetaPacienteCard key={receta.id} receta={receta} />
          ))}
        </div>
      )}

      {!recetasQ.loading && !recetasQ.error && filtradas.length > 0 ? (
        <p className="text-center text-xs text-slate-400">
          {ESTADO_RECETA_PACIENTE_LABEL.activo}: receta pendiente de surtir o
          surtida parcialmente. {ESTADO_RECETA_PACIENTE_LABEL.completado}:
          receta ya surtida en la farmacia.
        </p>
      ) : null}
    </div>
  );
}
