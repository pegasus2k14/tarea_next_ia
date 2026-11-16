"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconAlert, IconPill } from "@/components/ui/icons";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CATEGORIA_LABEL } from "@/lib/constants";
import { estadoCaducidad } from "@/lib/format";
import { api } from "@/services";
import type {
  CategoriaMedicamento,
  CrearMedicamentoRequest,
  Medicamento,
} from "@/types";

interface FormState {
  nombre: string;
  principioActivo: string;
  presentacion: string;
  laboratorio: string;
  categoria: CategoriaMedicamento | "";
  precio: string;
  stock: string;
  stockMinimo: string;
  lote: string;
  fechaVencimiento: string;
  requiereReceta: boolean;
}

const ESTADO_INICIAL: FormState = {
  nombre: "",
  principioActivo: "",
  presentacion: "",
  laboratorio: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "20",
  lote: "",
  fechaVencimiento: "",
  requiereReceta: false,
};

function validar(form: FormState): string | null {
  const texto: Array<[keyof FormState, string]> = [
    ["nombre", "El nombre del medicamento es obligatorio."],
    ["principioActivo", "El principio activo es obligatorio."],
    ["presentacion", "La presentación es obligatoria."],
    ["laboratorio", "El laboratorio es obligatorio."],
    ["lote", "El lote es obligatorio."],
  ];

  for (const [campo, mensaje] of texto) {
    const valor = form[campo];
    if (typeof valor !== "string" || !valor.trim()) return mensaje;
  }

  if (!form.categoria) return "Selecciona una categoría.";

  const precio = Number(form.precio);
  if (!Number.isFinite(precio) || precio < 0) {
    return "El precio debe ser un número mayor o igual a cero.";
  }

  const stock = Number(form.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    return "El stock debe ser un número entero mayor o igual a cero.";
  }

  const stockMinimo = Number(form.stockMinimo);
  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
    return "El stock mínimo debe ser un número entero mayor o igual a cero.";
  }

  if (!form.fechaVencimiento) {
    return "La fecha de caducidad es obligatoria.";
  }
  if (Number.isNaN(new Date(form.fechaVencimiento).getTime())) {
    return "La fecha de caducidad no es válida.";
  }
  if (estadoCaducidad(form.fechaVencimiento) === "caducado") {
    return "La fecha de caducidad no puede estar en el pasado.";
  }

  return null;
}

/**
 * Modal para registrar un medicamento o un lote nuevo.
 * Mantiene el formulario como Client Component porque usa estado y eventos.
 */
export function MedicamentoFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (medicamento: Medicamento) => void;
}) {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function actualizar<K extends keyof FormState>(
    campo: K,
    valor: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setError(null);
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const mensaje = validar(form);
    if (mensaje) {
      setError(mensaje);
      return;
    }

    const payload: CrearMedicamentoRequest = {
      nombre: form.nombre.trim(),
      principioActivo: form.principioActivo.trim(),
      presentacion: form.presentacion.trim(),
      laboratorio: form.laboratorio.trim(),
      categoria: form.categoria as CategoriaMedicamento,
      precio: Number(form.precio),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      requiereReceta: form.requiereReceta,
      lote: form.lote.trim(),
      fechaVencimiento: form.fechaVencimiento,
    };

    setGuardando(true);
    try {
      const creado = await api.medicamentos.crear(payload);
      setGuardando(false);
      onCreated(creado);
    } catch (err) {
      setGuardando(false);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el medicamento.",
      );
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar medicamento"
      description="Agrega un medicamento nuevo o un lote al inventario de la farmacia."
    >
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="med-nombre">Nombre</Label>
            <Input
              id="med-nombre"
              value={form.nombre}
              onChange={(event) => actualizar("nombre", event.target.value)}
              placeholder="Ej. Amoxicilina"
            />
          </div>
          <div>
            <Label htmlFor="med-principio">Principio activo</Label>
            <Input
              id="med-principio"
              value={form.principioActivo}
              onChange={(event) =>
                actualizar("principioActivo", event.target.value)
              }
              placeholder="Ej. Amoxicilina trihidratada"
            />
          </div>
          <div>
            <Label htmlFor="med-presentacion">Presentación</Label>
            <Input
              id="med-presentacion"
              value={form.presentacion}
              onChange={(event) =>
                actualizar("presentacion", event.target.value)
              }
              placeholder="Ej. Cápsula 500 mg"
            />
          </div>
          <div>
            <Label htmlFor="med-laboratorio">Laboratorio</Label>
            <Input
              id="med-laboratorio"
              value={form.laboratorio}
              onChange={(event) =>
                actualizar("laboratorio", event.target.value)
              }
              placeholder="Ej. Senosiain"
            />
          </div>
          <div>
            <Label htmlFor="med-categoria">Categoría</Label>
            <Select
              id="med-categoria"
              value={form.categoria}
              onChange={(event) =>
                actualizar(
                  "categoria",
                  event.target.value as CategoriaMedicamento | "",
                )
              }
            >
              <option value="">Selecciona una categoría</option>
              {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="med-precio">Precio unitario (MXN)</Label>
            <Input
              id="med-precio"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(event) => actualizar("precio", event.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="med-stock">Stock inicial</Label>
            <Input
              id="med-stock"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) => actualizar("stock", event.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="med-stock-minimo">Stock mínimo</Label>
            <Input
              id="med-stock-minimo"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.stockMinimo}
              onChange={(event) =>
                actualizar("stockMinimo", event.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor="med-lote">Lote</Label>
            <Input
              id="med-lote"
              value={form.lote}
              onChange={(event) => actualizar("lote", event.target.value)}
              placeholder="Ej. AMX-26A01"
            />
          </div>
          <div>
            <Label htmlFor="med-caducidad">Fecha de caducidad</Label>
            <Input
              id="med-caducidad"
              type="date"
              value={form.fechaVencimiento}
              onChange={(event) =>
                actualizar("fechaVencimiento", event.target.value)
              }
            />
          </div>
        </div>

        <label
          htmlFor="med-receta"
          className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-600"
        >
          <input
            id="med-receta"
            type="checkbox"
            checked={form.requiereReceta}
            onChange={(event) =>
              actualizar("requiereReceta", event.target.checked)
            }
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500/40"
          />
          <span>
            Requiere receta médica
            <span className="mt-0.5 block text-xs text-slate-400">
              Se validará la prescripción al momento de la entrega.
            </span>
          </span>
        </label>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            <IconPill className="h-4 w-4" />
            {guardando ? "Guardando…" : "Registrar medicamento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
