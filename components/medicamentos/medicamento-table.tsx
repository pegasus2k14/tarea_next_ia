import { CaducidadBadge } from "@/components/medicamentos/caducidad-badge";
import { StockBadge } from "@/components/medicamentos/stock-badge";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@/components/ui/icons";
import { CATEGORIA_LABEL } from "@/lib/constants";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Medicamento } from "@/types";

export function MedicamentoTable({
  medicamentos,
  onReponer,
  reponiendoId,
}: {
  medicamentos: Medicamento[];
  onReponer?: (medicamento: Medicamento) => void;
  reponiendoId?: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <th scope="col" className="px-4 py-3 font-semibold">
              Medicamento
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Descripción
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Stock actual
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Lote
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Caducidad
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Precio
            </th>
            {onReponer ? (
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Acción
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {medicamentos.map((medicamento) => (
            <tr
              key={medicamento.id}
              className="transition-colors hover:bg-slate-50/70"
            >
              <td className="px-4 py-3.5">
                <p className="font-semibold text-slate-800">
                  {medicamento.nombre}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {medicamento.laboratorio}
                </p>
              </td>
              <td className="px-4 py-3.5">
                <p className="text-xs font-medium text-slate-600">
                  {medicamento.principioActivo}
                </p>
                <p className="text-xs text-slate-500">
                  {medicamento.presentacion}
                </p>
                <p className="text-[11px] text-slate-400">
                  {CATEGORIA_LABEL[medicamento.categoria]}
                </p>
              </td>
              <td className="px-4 py-3.5">
                <p
                  className={cn(
                    "font-semibold tabular-nums",
                    medicamento.stock === 0
                      ? "text-rose-600"
                      : medicamento.estado === "bajo"
                        ? "text-amber-600"
                        : "text-slate-800",
                  )}
                >
                  {medicamento.stock} u.
                </p>
                <p className="text-[11px] text-slate-400">
                  mínimo {medicamento.stockMinimo}
                </p>
                <div className="mt-1">
                  <StockBadge estado={medicamento.estado} />
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-xs text-slate-600">
                  {medicamento.lote ?? "—"}
                </span>
                {medicamento.requiereReceta ? (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Requiere receta
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3.5">
                <p className="text-xs text-slate-600">
                  {formatearFecha(medicamento.fechaVencimiento)}
                </p>
                <div className="mt-1">
                  <CaducidadBadge
                    fecha={medicamento.fechaVencimiento}
                    soloAlerta
                  />
                </div>
              </td>
              <td className="px-4 py-3.5 tabular-nums text-slate-600">
                {formatearMoneda(medicamento.precio)}
              </td>
              {onReponer ? (
                <td className="px-4 py-3.5 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onReponer(medicamento)}
                    disabled={reponiendoId === medicamento.id}
                    aria-label={`Reponer 20 unidades de ${medicamento.nombre}`}
                  >
                    <IconRefresh className="h-3.5 w-3.5" />
                    {reponiendoId === medicamento.id ? "Guardando…" : "+20"}
                  </Button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
