"use client";

import Link from "next/link";
import { StockBadge } from "@/components/medicamentos/stock-badge";
import { RecetaEstadoBadge } from "@/components/recetas/receta-estado-badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  IconAlert,
  IconArrowRight,
  IconBoxes,
  IconChevronRight,
  IconClipboard,
  IconPill,
  IconStethoscope,
  IconTrendingDown,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useAsync } from "@/hooks/use-async";
import { formatearFecha } from "@/lib/format";
import { api } from "@/services";

export default function AdminPage() {
  const medicamentosQ = useAsync(
    () => api.medicamentos.listar({ limit: 100 }),
    [],
  );
  const recetasQ = useAsync(() => api.recetas.listar({ limit: 100 }), []);

  const medicamentos = medicamentosQ.data?.items ?? [];
  const recetas = recetasQ.data?.items ?? [];
  const stockBajo = medicamentos.filter(
    (medicamento) => medicamento.estado === "bajo",
  );
  const agotados = medicamentos.filter(
    (medicamento) => medicamento.estado === "agotado",
  );
  const pendientes = recetas.filter((receta) => receta.estado === "pendiente");
  const porReponer = [...stockBajo, ...agotados].slice(0, 5);
  const recientes = [...recetas]
    .sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision))
    .slice(0, 4);

  const cargando = medicamentosQ.loading || recetasQ.loading;
  const error = medicamentosQ.error ?? recetasQ.error;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-brand-950 to-brand-800 p-6 shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-400/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 right-32 h-60 w-60 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-100 ring-1 ring-inset ring-white/15">
              <IconStethoscope className="h-3.5 w-3.5" />
              Vista del farmacéutico
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Panel de farmacia
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-100/85">
              Supervisa existencias, detecta faltantes y da seguimiento a las
              recetas pendientes de dispensar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/inventario"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-900 shadow-sm transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <IconBoxes className="h-4 w-4" />
              Gestionar inventario
            </Link>
            <Link
              href="/admin/recetas"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Revisar recetas
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <ErrorState
          message={error.message}
          onRetry={() => {
            medicamentosQ.reload();
            recetasQ.reload();
          }}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Medicamentos registrados"
          value={cargando ? "—" : medicamentos.length}
          hint="En el catálogo de la farmacia"
          icon={<IconPill className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Stock bajo"
          value={cargando ? "—" : stockBajo.length}
          hint="Por debajo del mínimo"
          icon={<IconTrendingDown className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Agotados"
          value={cargando ? "—" : agotados.length}
          hint="Sin existencias para entrega"
          icon={<IconAlert className="h-5 w-5" />}
          tone="rose"
        />
        <StatCard
          label="Recetas pendientes"
          value={cargando ? "—" : pendientes.length}
          hint="Listas para revisar y dispensar"
          icon={<IconClipboard className="h-5 w-5" />}
          tone="sky"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-end justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Requieren reabastecimiento
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Medicamentos con stock bajo o agotado.
              </p>
            </div>
            <Link
              href="/admin/inventario"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              Inventario
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {medicamentosQ.loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : porReponer.length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={<IconBoxes className="h-5 w-5" />}
              title="Inventario saludable"
              description="Todos los medicamentos están por encima del stock mínimo."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {porReponer.map((medicamento) => (
                <li
                  key={medicamento.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <IconPill className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {medicamento.nombre}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {medicamento.presentacion}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-800">
                      {medicamento.stock} u.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      mín. {medicamento.stockMinimo}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <StockBadge estado={medicamento.estado} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-end justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recetas recientes
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Últimos movimientos del expediente.
              </p>
            </div>
            <Link
              href="/admin/recetas"
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              Ver todas
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recetasQ.loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={<IconClipboard className="h-5 w-5" />}
              title="Sin recetas registradas"
              description="Las recetas capturadas aparecerán en este panel."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((receta) => (
                <li
                  key={receta.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <IconClipboard className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {receta.pacienteNombre}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {receta.codigo} · {formatearFecha(receta.fechaEmision)}
                    </p>
                  </div>
                  <RecetaEstadoBadge estado={receta.estado} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
