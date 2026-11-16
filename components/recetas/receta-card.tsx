import { RecetaEstadoBadge } from "@/components/recetas/receta-estado-badge";
import { Card } from "@/components/ui/card";
import { IconCalendar, IconClipboard, IconStethoscope } from "@/components/ui/icons";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import type { Receta } from "@/types";

export function RecetaCard({
  receta,
  variant = "default",
}: {
  receta: Receta;
  variant?: "default" | "compact";
}) {
  const compacta = variant === "compact";

  return (
    <Card className={compacta ? "p-4" : "p-5"}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-wide text-slate-400">
            {receta.codigo}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {receta.pacienteNombre}
          </h3>
        </div>
        <RecetaEstadoBadge estado={receta.estado} />
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <IconStethoscope className="h-3.5 w-3.5" />
          {receta.medicoNombre}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5" />
          {formatearFecha(receta.fechaEmision)}
        </span>
      </div>

      <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-3.5">
        {receta.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">
                {item.nombreMedicamento}
                {!compacta && item.presentacion ? (
                  <span className="font-normal text-slate-400">
                    {" "}
                    · {item.presentacion}
                  </span>
                ) : null}
              </p>
              {item.indicaciones ? (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  {item.indicaciones}
                </p>
              ) : null}
            </div>
            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
              ×{item.cantidad}
            </span>
          </li>
        ))}
      </ul>

      {receta.notas && !compacta ? (
        <p className="mt-3.5 flex items-start gap-1.5 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          <IconClipboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          {receta.notas}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <span className="text-xs text-slate-500">Total estimado</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {formatearMoneda(receta.total)}
        </span>
      </div>
    </Card>
  );
}
