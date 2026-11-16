"use client";

import { useState } from "react";
import { RecetaCard } from "@/components/recetas/receta-card";
import { RecetaForm } from "@/components/recetas/receta-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  IconCheck,
  IconClipboard,
  IconPlus,
  IconX,
} from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { ESTADO_RECETA_LABEL, ESTADOS_RECETA } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@/services";
import type { EstadoReceta } from "@/types";

type Filtro = "todas" | EstadoReceta;

const FILTROS: Filtro[] = ["todas", ...ESTADOS_RECETA];

export default function AdminRecetasPage() {
  const recetasQ = useAsync(() => api.recetas.listar({ limit: 100 }), []);
  const medicamentosQ = useAsync(
    () => api.medicamentos.listar({ limit: 100 }),
    [],
  );
  const pacientesQ = useAsync(() => api.pacientes.listar({ limit: 100 }), []);

  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  const recetas = recetasQ.data?.items ?? [];
  const medicamentos = medicamentosQ.data?.items ?? [];
  const pacientes = pacientesQ.data?.items ?? [];
  const filtradas =
    filtro === "todas"
      ? recetas
      : recetas.filter((receta) => receta.estado === filtro);

  const errorDependencias = medicamentosQ.error ?? pacientesQ.error;
  const formularioListo =
    !medicamentosQ.loading &&
    !pacientesQ.loading &&
    medicamentos.length > 0 &&
    pacientes.length > 0;

  function contar(estado: Filtro): number {
    return estado === "todas"
      ? recetas.length
      : recetas.filter((receta) => receta.estado === estado).length;
  }

  function alternarFormulario() {
    setMostrarFormulario((visible) => !visible);
    setExito(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recetas"
        description={
          recetasQ.loading
            ? "Consultando recetas de la farmacia…"
            : `${recetas.length} recetas registradas. Crea nuevas prescripciones y da seguimiento a su estado.`
        }
        actions={
          <Button
            variant={mostrarFormulario ? "secondary" : "primary"}
            onClick={alternarFormulario}
            aria-expanded={mostrarFormulario}
            disabled={Boolean(errorDependencias)}
          >
            {mostrarFormulario ? (
              <>
                <IconX className="h-4 w-4" />
                Cerrar formulario
              </>
            ) : (
              <>
                <IconPlus className="h-4 w-4" />
                Nueva receta
              </>
            )}
          </Button>
        }
      />

      {exito ? (
        <div
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
          role="status"
        >
          <span className="flex items-start gap-2">
            <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {exito}
          </span>
          <button
            type="button"
            onClick={() => setExito(null)}
            aria-label="Cerrar aviso"
            className="text-emerald-700/70 transition-colors hover:text-emerald-900"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {mostrarFormulario ? (
        formularioListo ? (
          <RecetaForm
            medicamentos={medicamentos}
            pacientes={pacientes}
            onCreated={(receta) => {
              setMostrarFormulario(false);
              setExito(
                `Receta ${receta.codigo} creada para ${receta.pacienteNombre}.`,
              );
              recetasQ.reload();
            }}
            onCancel={() => setMostrarFormulario(false)}
          />
        ) : errorDependencias ? (
          <ErrorState
            message={errorDependencias.message}
            onRetry={() => {
              medicamentosQ.reload();
              pacientesQ.reload();
            }}
          />
        ) : (
          <Card className="p-5">
            <Skeleton className="h-6 w-40" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="mt-4 h-28 w-full" />
          </Card>
        )
      ) : null}

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
              ? "Sin recetas registradas"
              : "No hay recetas con este estado"
          }
          description={
            recetas.length === 0
              ? "Crea la primera receta con el botón «Nueva receta»."
              : "Cambia el filtro para consultar otras recetas."
          }
          action={
            recetas.length === 0 ? (
              <Button size="sm" onClick={alternarFormulario}>
                <IconPlus className="h-3.5 w-3.5" />
                Nueva receta
              </Button>
            ) : undefined
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
