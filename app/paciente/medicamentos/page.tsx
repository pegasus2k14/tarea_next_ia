"use client";

import { useState } from "react";
import { StockBadge } from "@/components/medicamentos/stock-badge";
import { StockChecker } from "@/components/medicamentos/stock-checker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { IconInfo, IconSearch } from "@/components/ui/icons";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import {
  CATEGORIA_LABEL,
  ESTADO_STOCK_LABEL,
} from "@/lib/constants";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { normalizarTexto } from "@/lib/utils";
import { api } from "@/services";
import type {
  CategoriaMedicamento,
  EstadoStock,
} from "@/types";

export default function MedicamentosPage() {
  const medicamentosQ = useAsync(
    () => api.medicamentos.listar({ limit: 100 }),
    [],
  );
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<CategoriaMedicamento | "">("");
  const [estado, setEstado] = useState<EstadoStock | "">("");

  const medicamentos = medicamentosQ.data?.items ?? [];
  const termino = normalizarTexto(busqueda);

  const filtrados = medicamentos.filter((medicamento) => {
    if (categoria && medicamento.categoria !== categoria) return false;
    if (estado && medicamento.estado !== estado) return false;
    if (!termino) return true;

    return normalizarTexto(
      `${medicamento.nombre} ${medicamento.principioActivo} ${medicamento.laboratorio} ${medicamento.presentacion}`,
    ).includes(termino);
  });

  const hayFiltros = Boolean(busqueda || categoria || estado);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de medicamentos"
        description="Consulta presentaciones, precios y existencias antes de acudir a la farmacia."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_190px_170px]">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Buscar por nombre, principio activo…"
                  className="pl-9"
                  aria-label="Buscar medicamentos"
                />
              </div>
              <Select
                value={categoria}
                onChange={(event) =>
                  setCategoria(
                    event.target.value as CategoriaMedicamento | "",
                  )
                }
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select
                value={estado}
                onChange={(event) =>
                  setEstado(event.target.value as EstadoStock | "")
                }
                aria-label="Filtrar por existencias"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADO_STOCK_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {medicamentosQ.loading
                ? "Cargando catálogo…"
                : `${filtrados.length} de ${medicamentos.length} medicamentos`}
            </p>
            {hayFiltros ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusqueda("");
                  setCategoria("");
                  setEstado("");
                }}
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>

          {medicamentosQ.loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-56 w-full" />
              ))}
            </div>
          ) : medicamentosQ.error ? (
            <ErrorState
              message={medicamentosQ.error.message}
              onRetry={medicamentosQ.reload}
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              icon={<IconSearch className="h-5 w-5" />}
              title="Sin resultados"
              description="No encontramos medicamentos con los filtros seleccionados. Prueba con otro término."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setBusqueda("");
                    setCategoria("");
                    setEstado("");
                  }}
                >
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtrados.map((medicamento) => (
                <Card
                  key={medicamento.id}
                  className="flex flex-col p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="brand">
                      {CATEGORIA_LABEL[medicamento.categoria]}
                    </Badge>
                    <StockBadge estado={medicamento.estado} />
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-slate-900">
                    {medicamento.nombre}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {medicamento.principioActivo}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {medicamento.presentacion} · {medicamento.laboratorio}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {medicamento.requiereReceta ? (
                      <Badge variant="info">Requiere receta</Badge>
                    ) : (
                      <Badge variant="neutral">Venta libre</Badge>
                    )}
                    <Badge variant="neutral">
                      {medicamento.stock} en existencia
                    </Badge>
                  </div>
                  <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                    <p className="pt-1 text-lg font-semibold tabular-nums text-slate-900">
                      {formatearMoneda(medicamento.precio)}
                    </p>
                    <p className="pt-1 text-[11px] text-slate-400">
                      Vence {formatearFecha(medicamento.fechaVencimiento)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24 lg:self-start">
          <StockChecker medicamentos={medicamentos} />
          <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-900">
              <IconInfo className="h-4 w-4" />
              ¿Necesitas una receta?
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-brand-900/70">
              Los medicamentos marcados como{" "}
              <span className="font-semibold">Requiere receta</span> solo se
              entregan con una prescripción vigente. El farmacéutico validará el
              documento al momento de la entrega.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
