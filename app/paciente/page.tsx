"use client";

import Link from "next/link";
import { StockChecker } from "@/components/medicamentos/stock-checker";
import { RecetaCard } from "@/components/recetas/receta-card";
import {
  IconAlert,
  IconArrowRight,
  IconChevronRight,
  IconClipboard,
  IconPill,
  IconTrendingDown,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useRole } from "@/components/providers/role-provider";
import { useAsync } from "@/hooks/use-async";
import { formatearMoneda } from "@/lib/format";
import { api } from "@/services";
import { StockBadge } from "@/components/medicamentos/stock-badge";

export default function PacientePage() {
  const { usuario } = useRole();
  const recetasQ = useAsync(
    () => api.recetas.listarPorUsuario(usuario.id, { limit: 20 }),
    [usuario.id],
  );
  const medicamentosQ = useAsync(
    () => api.medicamentos.listar({ limit: 100 }),
    [],
  );

  const recetas = recetasQ.data?.items ?? [];
  const medicamentos = medicamentosQ.data?.items ?? [];
  const recetasActivas = recetas.filter(
    (receta) => receta.estado === "pendiente" || receta.estado === "parcial",
  );
  const disponibles = medicamentos.filter(
    (medicamento) => medicamento.estado === "disponible",
  ).length;
  const porReponer = medicamentos.filter(
    (medicamento) => medicamento.estado !== "disponible",
  ).length;
  const destacados = medicamentos
    .filter((medicamento) => medicamento.estado === "disponible")
    .slice(0, 4);
  const primerNombre = usuario.nombre.split(" ")[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-teal-700 p-6 shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-100 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Vista de paciente
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Hola, {primerNombre}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-brand-100/90">
              Consulta tus recetas, revisa la disponibilidad de tus medicamentos
              y mantén tu tratamiento al día.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/paciente/recetas"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-800 shadow-sm transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Ver mis recetas
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/paciente/medicamentos"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <IconPill className="h-4 w-4" />
              Catálogo
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Recetas activas"
          value={recetasQ.loading ? "—" : recetasActivas.length}
          hint="Pendientes o parcialmente surtidas"
          icon={<IconClipboard className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Medicamentos disponibles"
          value={medicamentosQ.loading ? "—" : disponibles}
          hint="Con existencias en la farmacia"
          icon={<IconPill className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Por reabastecer"
          value={medicamentosQ.loading ? "—" : porReponer}
          hint="Stock bajo o agotado"
          icon={<IconTrendingDown className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Recetas activas
              </h2>
              <p className="text-xs text-slate-500">
                Tratamientos que aún requieren surtido.
              </p>
            </div>
            <Link
              href="/paciente/recetas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              Ver todas
              <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recetasQ.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          ) : recetasQ.error ? (
            <ErrorState
              message={recetasQ.error.message}
              onRetry={recetasQ.reload}
            />
          ) : recetasActivas.length > 0 ? (
            <div className="space-y-3">
              {recetasActivas.slice(0, 2).map((receta) => (
                <RecetaCard key={receta.id} receta={receta} variant="compact" />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<IconClipboard className="h-5 w-5" />}
              title="Sin recetas activas"
              description="Cuando tu médico emita una receta, aparecerá aquí con el detalle de tus medicamentos."
              action={
                <Link
                  href="/paciente/recetas"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Revisar historial
                </Link>
              }
            />
          )}
        </section>

        <div className="space-y-4">
          {medicamentosQ.error ? (
            <ErrorState
              message={medicamentosQ.error.message}
              onRetry={medicamentosQ.reload}
            />
          ) : null}
          <StockChecker medicamentos={medicamentos} />
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Disponibles ahora
            </h2>
            <p className="text-xs text-slate-500">
              Una muestra del catálogo con existencias.
            </p>
          </div>
          <Link
            href="/paciente/medicamentos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            Ver catálogo
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {medicamentosQ.loading ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : destacados.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((medicamento) => (
              <div
                key={medicamento.id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {medicamento.nombre}
                  </p>
                  <StockBadge estado={medicamento.estado} />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {medicamento.presentacion}
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {formatearMoneda(medicamento.precio)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {medicamento.stock} u.
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <IconAlert className="h-4 w-4" />
            No hay medicamentos con existencias en este momento.
          </p>
        )}
      </Card>
    </div>
  );
}
