"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconAlert, IconPlus, IconX } from "@/components/ui/icons";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatearMoneda } from "@/lib/format";
import { api } from "@/services";
import type {
  CrearRecetaRequest,
  Medicamento,
  Receta,
  Usuario,
} from "@/types";

interface ItemDraft {
  key: string;
  medicamentoId: string;
  cantidad: number;
  dosis: string;
  frecuencia: string;
  indicaciones: string;
}

const FRECUENCIAS = [
  "Cada 4 horas",
  "Cada 6 horas",
  "Cada 8 horas",
  "Cada 12 horas",
  "Cada 24 horas",
  "Una vez al día",
  "Según necesidad",
];

function componerIndicaciones(item: ItemDraft): string | undefined {
  const partes = [item.dosis.trim(), item.frecuencia, item.indicaciones.trim()]
    .map((parte) => parte.replace(/[.\s]+$/, ""))
    .filter(Boolean);

  if (partes.length === 0) return undefined;
  return `${partes.join(". ")}.`;
}

export function RecetaForm({
  medicamentos,
  pacientes,
  onCreated,
  onCancel,
}: {
  medicamentos: Medicamento[];
  pacientes: Usuario[];
  onCreated: (receta: Receta) => void;
  onCancel: () => void;
}) {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string | null>(
    null,
  );
  const [medicoNombre, setMedicoNombre] = useState("");
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([
    {
      key: "item-1",
      medicamentoId: "",
      cantidad: 1,
      dosis: "",
      frecuencia: "",
      indicaciones: "",
    },
  ]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const siguienteItem = useRef(2);

  const pacienteId = pacienteSeleccionado ?? pacientes[0]?.id ?? "";

  function actualizarItem(key: string, cambios: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...cambios } : item)),
    );
  }

  function agregarItem() {
    setItems((prev) => [
      ...prev,
      {
        key: `item-${siguienteItem.current++}`,
        medicamentoId: "",
        cantidad: 1,
        dosis: "",
        frecuencia: "",
        indicaciones: "",
      },
    ]);
  }

  function quitarItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  const totalEstimado = items.reduce((total, item) => {
    const medicamento = medicamentos.find((m) => m.id === item.medicamentoId);
    return total + (medicamento?.precio ?? 0) * item.cantidad;
  }, 0);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!pacienteId) {
      setError("Selecciona un paciente.");
      return;
    }
    if (!medicoNombre.trim()) {
      setError("Indica el nombre del médico que emite la receta.");
      return;
    }

    const itemsValidos = items.filter(
      (item) => item.medicamentoId && item.cantidad > 0,
    );
    if (itemsValidos.length === 0) {
      setError("Agrega al menos un medicamento con cantidad válida.");
      return;
    }

    for (const item of itemsValidos) {
      const medicamento = medicamentos.find(
        (candidato) => candidato.id === item.medicamentoId,
      );
      if (!medicamento) {
        setError("El medicamento seleccionado ya no está disponible.");
        return;
      }
      if (medicamento.stock === 0) {
        setError(
          `No hay existencias de ${medicamento.nombre}. Repón el inventario antes de emitir la receta.`,
        );
        return;
      }
      if (item.cantidad > medicamento.stock) {
        setError(
          `Solo hay ${medicamento.stock} unidades de ${medicamento.nombre} y solicitaste ${item.cantidad}.`,
        );
        return;
      }
      if (!item.dosis.trim()) {
        setError(`Indica la dosis de ${medicamento.nombre}.`);
        return;
      }
      if (!item.frecuencia) {
        setError(`Selecciona la frecuencia de ${medicamento.nombre}.`);
        return;
      }
    }

    const payload: CrearRecetaRequest = {
      usuarioId: pacienteId,
      medicoNombre: medicoNombre.trim(),
      items: itemsValidos.map((item) => ({
        medicamentoId: item.medicamentoId,
        cantidad: item.cantidad,
        dosis: item.dosis.trim() || undefined,
        frecuencia: item.frecuencia || undefined,
        indicaciones: componerIndicaciones(item),
      })),
      notas: notas.trim() || undefined,
    };

    setEnviando(true);
    try {
      const receta = await api.recetas.crear(payload);
      onCreated(receta);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear la receta.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Nueva receta
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Captura los medicamentos indicados y valida existencias al guardar.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar formulario"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={enviar} className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="receta-paciente">Paciente</Label>
            <Select
              id="receta-paciente"
              value={pacienteId}
              onChange={(event) => setPacienteSeleccionado(event.target.value)}
              required
            >
              <option value="">Selecciona un paciente</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="receta-medico">Médico que prescribe</Label>
            <Input
              id="receta-medico"
              placeholder="Ej. Dra. Elena Ríos"
              value={medicoNombre}
              onChange={(event) => setMedicoNombre(event.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Medicamentos</p>
            <Button variant="soft" size="sm" onClick={agregarItem}>
              <IconPlus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const medicamento = medicamentos.find(
                (candidato) => candidato.id === item.medicamentoId,
              );
              const sinStock = medicamento?.stock === 0;
              const excedeStock = Boolean(
                medicamento &&
                  medicamento.stock > 0 &&
                  item.cantidad > medicamento.stock,
              );

              return (
                <div
                  key={item.key}
                  className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px_auto]">
                    <div>
                      <Label
                        htmlFor={`receta-med-${item.key}`}
                        className="text-xs text-slate-500"
                      >
                        Medicamento {index + 1}
                      </Label>
                      <Select
                        id={`receta-med-${item.key}`}
                        value={item.medicamentoId}
                        onChange={(event) =>
                          actualizarItem(item.key, {
                            medicamentoId: event.target.value,
                          })
                        }
                      >
                        <option value="">Selecciona un medicamento</option>
                        {medicamentos.map((opcion) => (
                          <option key={opcion.id} value={opcion.id}>
                            {opcion.nombre} · {opcion.presentacion}
                            {opcion.stock === 0
                              ? " (sin existencias)"
                              : ` (${opcion.stock} u.)`}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor={`receta-cant-${item.key}`}
                        className="text-xs text-slate-500"
                      >
                        Cantidad
                      </Label>
                      <Input
                        id={`receta-cant-${item.key}`}
                        type="number"
                        min={1}
                        max={999}
                        value={item.cantidad}
                        onChange={(event) =>
                          actualizarItem(item.key, {
                            cantidad: Math.max(
                              0,
                              Number(event.target.value) || 0,
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => quitarItem(item.key)}
                        disabled={items.length === 1}
                        aria-label={`Quitar medicamento ${index + 1}`}
                        className="mb-0.5"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label
                        htmlFor={`receta-dosis-${item.key}`}
                        className="text-xs text-slate-500"
                      >
                        Dosis
                      </Label>
                      <Input
                        id={`receta-dosis-${item.key}`}
                        placeholder="Ej. 1 cápsula"
                        value={item.dosis}
                        onChange={(event) =>
                          actualizarItem(item.key, {
                            dosis: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`receta-frec-${item.key}`}
                        className="text-xs text-slate-500"
                      >
                        Frecuencia
                      </Label>
                      <Select
                        id={`receta-frec-${item.key}`}
                        value={item.frecuencia}
                        onChange={(event) =>
                          actualizarItem(item.key, {
                            frecuencia: event.target.value,
                          })
                        }
                      >
                        <option value="">Selecciona la frecuencia</option>
                        {FRECUENCIAS.map((frecuencia) => (
                          <option key={frecuencia} value={frecuencia}>
                            {frecuencia}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor={`receta-ind-${item.key}`}
                      className="text-xs text-slate-500"
                    >
                      Indicaciones adicionales (opcional)
                    </Label>
                    <Input
                      id={`receta-ind-${item.key}`}
                      placeholder="Ej. Tomar con alimentos durante 7 días"
                      value={item.indicaciones}
                      onChange={(event) =>
                        actualizarItem(item.key, {
                          indicaciones: event.target.value,
                        })
                      }
                    />
                  </div>

                  {sinStock ? (
                    <p
                      role="alert"
                      className="flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700"
                    >
                      <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {medicamento?.nombre} no tiene existencias. Repón el
                      inventario antes de emitir la receta.
                    </p>
                  ) : null}

                  {excedeStock ? (
                    <p
                      role="alert"
                      className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800"
                    >
                      <IconAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Solo quedan {medicamento?.stock} unidades de{" "}
                      {medicamento?.nombre}.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="receta-notas">Notas para el paciente (opcional)</Label>
          <Textarea
            id="receta-notas"
            placeholder="Indicaciones generales, recomendaciones o advertencias."
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
          />
        </div>

        {error ? (
          <p
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            role="alert"
          >
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Total estimado:{" "}
            <span className="font-semibold tabular-nums text-slate-900">
              {formatearMoneda(totalEstimado)}
            </span>
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Crear receta"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
