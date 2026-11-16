"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { Label, Select } from "@/components/ui/input";
import { ESTADO_RECETA_LABEL, ESTADOS_RECETA } from "@/lib/constants";
import type { EstadoReceta } from "@/types";

/**
 * Control para que el farmacéutico cambie el estado de una receta.
 * Mantiene una selección local y la sincroniza cuando la receta se recarga.
 */
export function RecetaEstadoControl({
  recetaId,
  estado,
  cambiando = false,
  onCambiar,
}: {
  recetaId: string;
  estado: EstadoReceta;
  cambiando?: boolean;
  onCambiar: (estado: EstadoReceta) => void | Promise<void>;
}) {
  const [borrador, setBorrador] = useState<{
    base: EstadoReceta;
    valor: EstadoReceta;
  } | null>(null);

  // Se deriva del prop: al recargar la receta, la selección vuelve al estado real.
  const seleccion = borrador?.base === estado ? borrador.valor : estado;
  const sinCambios = seleccion === estado;
  const idSelect = `estado-receta-${recetaId}`;

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sinCambios || cambiando) return;
    void onCambiar(seleccion);
  }

  return (
    <form onSubmit={enviar} className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <Label htmlFor={idSelect} className="text-xs">
            Estado de la receta
          </Label>
          <Select
            id={idSelect}
            value={seleccion}
            onChange={(event) =>
              setBorrador({
                base: estado,
                valor: event.target.value as EstadoReceta,
              })
            }
            disabled={cambiando}
            className="h-9 text-xs"
          >
            {ESTADOS_RECETA.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ESTADO_RECETA_LABEL[opcion]}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={sinCambios || cambiando}
          aria-busy={cambiando}
        >
          <IconCheck className="h-3.5 w-3.5" />
          {cambiando ? "Guardando…" : "Actualizar estado"}
        </Button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-400">
        {seleccion === "dispensada"
          ? "Al dispensar se descuenta del inventario el stock de los medicamentos pendientes."
          : "El nuevo estado se guarda de inmediato en la receta."}
      </p>
    </form>
  );
}
