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
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <th scope="col" className="px-4 py-3 font-semibold">
              Medicamento
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Categoría
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Existencias
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Vencimiento
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Precio
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Estado
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
                  {medicamento.principioActivo} · {medicamento.presentacion}
                </p>
                <p className="text-[11px] text-slate-400">
                  {medicamento.laboratorio}
                </p>
              </td>
              <td className="px-4 py-3.5 text-slate-600">
                {CATEGORIA_LABEL[medicamento.categoria]}
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
              </td>
              <td className="px-4 py-3.5 text-slate-600">
                {formatearFecha(medicamento.fechaVencimiento)}
              </td>
              <td className="px-4 py-3.5 tabular-nums text-slate-600">
                {formatearMoneda(medicamento.precio)}
              </td>
              <td className="px-4 py-3.5">
                <StockBadge estado={medicamento.estado} />
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
