"use client";

import { useState } from "react";
import { MedicamentoFormModal } from "@/components/medicamentos/medicamento-form";
import { MedicamentoTable } from "@/components/medicamentos/medicamento-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  IconAlert,
  IconBoxes,
  IconCheck,
  IconPlus,
  IconSearch,
} from "@/components/ui/icons";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import {
  CATEGORIA_LABEL,
  ESTADO_STOCK_LABEL,
} from "@/lib/constants";
import { estadoCaducidad } from "@/lib/format";
import { normalizarTexto } from "@/lib/utils";
import { api } from "@/services";
import type {
  CategoriaMedicamento,
  EstadoStock,
  Medicamento,
} from "@/types";

type Aviso = { tipo: "exito" | "error"; texto: string };

export default function InventarioPage() {
  const medicamentosQ = useAsync(
    () => api.medicamentos.listar({ limit: 100 }),
    [],
  );
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<CategoriaMedicamento | "">("");
  const [estado, setEstado] = useState<EstadoStock | "">("");
  const [reponiendoId, setReponiendoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const medicamentos = medicamentosQ.data?.items ?? [];
  const termino = normalizarTexto(busqueda);
  const bajo = medicamentos.filter((item) => item.estado === "bajo").length;
  const agotados = medicamentos.filter(
    (item) => item.estado === "agotado",
  ).length;
  const porCaducar = medicamentos.filter(
    (item) => estadoCaducidad(item.fechaVencimiento) === "proximo",
  ).length;

  const filtrados = medicamentos.filter((medicamento) => {
    if (categoria && medicamento.categoria !== categoria) return false;
    if (estado && medicamento.estado !== estado) return false;
    if (!termino) return true;

    return normalizarTexto(
      `${medicamento.nombre} ${medicamento.principioActivo} ${medicamento.laboratorio}`,
    ).includes(termino);
  });

  async function reponer(medicamento: Medicamento) {
    setReponiendoId(medicamento.id);
    setAviso(null);

    try {
      const actualizado = await api.medicamentos.actualizarStock(
        medicamento.id,
        medicamento.stock + 20,
      );
      setAviso({
        tipo: "exito",
        texto: `Se agregaron 20 unidades de ${actualizado.nombre}. Nuevo stock: ${actualizado.stock}.`,
      });
      medicamentosQ.reload();
    } catch (error) {
      setAviso({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el stock.",
      });
    } finally {
      setReponiendoId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventario"
        description="Actualiza existencias y detecta medicamentos que requieren reabastecimiento."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                setAviso(null);
                setMostrarFormulario(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              Nuevo medicamento
            </Button>
            <Badge variant="neutral">{medicamentos.length} registrados</Badge>
            <Badge variant="warning">{bajo} con stock bajo</Badge>
            <Badge variant="danger">{agotados} agotados</Badge>
            <Badge variant="info">{porCaducar} por caducar</Badge>
          </div>
        }
      />

      <Card className="p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_190px_170px_auto]">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar medicamento o principio activo…"
              className="pl-9"
              aria-label="Buscar en inventario"
            />
          </div>
          <Select
            value={categoria}
            onChange={(event) =>
              setCategoria(event.target.value as CategoriaMedicamento | "")
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
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_STOCK_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setBusqueda("");
              setCategoria("");
              setEstado("");
            }}
            disabled={!busqueda && !categoria && !estado}
          >
            Limpiar
          </Button>
        </div>
      </Card>

      {aviso ? (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            aviso.tipo === "exito"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role="status"
        >
          {aviso.tipo === "exito" ? (
            <IconCheck className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {aviso.texto}
        </div>
      ) : null}

      <Card className="overflow-hidden">
        {medicamentosQ.loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : medicamentosQ.error ? (
          <div className="p-4">
            <ErrorState
              message={medicamentosQ.error.message}
              onRetry={medicamentosQ.reload}
            />
          </div>
        ) : filtrados.length === 0 ? (
          <EmptyState
            className="m-4 border-0 bg-transparent"
            icon={<IconSearch className="h-5 w-5" />}
            title="Sin medicamentos para mostrar"
            description="Ajusta los filtros o registra nuevos medicamentos en el catálogo."
          />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                {filtrados.length} de {medicamentos.length} medicamentos
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <IconBoxes className="h-3.5 w-3.5" />
                Reposición rápida: +20 unidades
              </span>
            </div>
            <MedicamentoTable
              medicamentos={filtrados}
              onReponer={reponer}
              reponiendoId={reponiendoId}
            />
          </>
        )}
      </Card>

      {mostrarFormulario ? (
        <MedicamentoFormModal
          onClose={() => setMostrarFormulario(false)}
          onCreated={(medicamento: Medicamento) => {
            setMostrarFormulario(false);
            setAviso({
              tipo: "exito",
              texto: `Se registró ${medicamento.nombre} (lote ${
                medicamento.lote ?? "sin lote"
              }) con ${medicamento.stock} unidades.`,
            });
            medicamentosQ.reload();
          }}
        />
      ) : null}
    </div>
  );
}
