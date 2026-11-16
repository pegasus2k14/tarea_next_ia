"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  IconAlert,
  IconCheck,
  IconPill,
  IconSearch,
} from "@/components/ui/icons";
import { Input, Label, Select } from "@/components/ui/input";
import { api } from "@/services";
import type { Medicamento, VerificacionStock } from "@/types";

export function StockChecker({
  medicamentos,
  className,
}: {
  medicamentos: Medicamento[];
  className?: string;
}) {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState("1");
  const [resultado, setResultado] = useState<VerificacionStock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultando, setConsultando] = useState(false);

  const seleccionado = seleccion ?? medicamentos[0]?.id ?? "";

  async function verificar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seleccionado) return;

    setConsultando(true);
    setError(null);
    setResultado(null);

    try {
      const respuesta = await api.medicamentos.verificarStock(
        seleccionado,
        Number(cantidad),
      );
      setResultado(respuesta);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo verificar la disponibilidad.",
      );
    } finally {
      setConsultando(false);
    }
  }

  return (
    <Card className={className}>
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <IconSearch className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Verificar disponibilidad
            </h2>
            <p className="text-xs text-slate-500">
              Consulta existencias antes de acudir a la farmacia.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={verificar} className="space-y-3 p-5">
        <div>
          <Label htmlFor="stock-medicamento">Medicamento</Label>
          <Select
            id="stock-medicamento"
            value={seleccionado}
            onChange={(event) => {
              setSeleccion(event.target.value);
              setResultado(null);
              setError(null);
            }}
            disabled={medicamentos.length === 0}
          >
            {medicamentos.length === 0 ? (
              <option value="">Sin medicamentos disponibles</option>
            ) : null}
            {medicamentos.map((medicamento) => (
              <option key={medicamento.id} value={medicamento.id}>
                {medicamento.nombre} · {medicamento.presentacion}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="stock-cantidad">Cantidad requerida</Label>
          <Input
            id="stock-cantidad"
            type="number"
            min={1}
            max={999}
            inputMode="numeric"
            value={cantidad}
            onChange={(event) => {
              setCantidad(event.target.value);
              setResultado(null);
              setError(null);
            }}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={consultando || !seleccionado}
        >
          {consultando ? (
            <>
              <IconPill className="h-4 w-4 animate-pulse" />
              Consultando…
            </>
          ) : (
            <>
              <IconSearch className="h-4 w-4" />
              Consultar stock
            </>
          )}
        </Button>

        {resultado ? (
          <div
            className={`rounded-xl border p-3.5 ${
              resultado.disponible
                ? "border-emerald-200 bg-emerald-50/80"
                : "border-amber-200 bg-amber-50/80"
            }`}
            role="status"
          >
            <p
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                resultado.disponible ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {resultado.disponible ? (
                <IconCheck className="h-4 w-4" />
              ) : (
                <IconAlert className="h-4 w-4" />
              )}
              {resultado.disponible
                ? "Disponible para entrega"
                : "Existencias insuficientes"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {resultado.mensaje}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="flex items-start gap-1.5 text-xs text-rose-700" role="alert">
            <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
