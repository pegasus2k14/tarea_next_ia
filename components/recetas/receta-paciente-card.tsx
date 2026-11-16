import { RecetaPacienteEstadoBadge } from "@/components/recetas/receta-paciente-estado-badge";
import { Card } from "@/components/ui/card";
import {
  IconCalendar,
  IconClipboard,
  IconInfo,
  IconStethoscope,
} from "@/components/ui/icons";
import {
  formatearFecha,
  formatearMoneda,
  obtenerDosisYFrecuencia,
} from "@/lib/format";
import type { Receta } from "@/types";

/**
 * Tarjeta de receta pensada para el paciente: muestra cada medicamento con
 * dosis y frecuencia destacadas, y el estado en lenguaje claro
 * ("Activo" / "Completado").
 */
export function RecetaPacienteCard({
  receta,
  variant = "default",
}: {
  receta: Receta;
  variant?: "default" | "compact";
}) {
  const compacta = variant === "compact";

  return (
    <Card className="overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium tracking-wide text-slate-400">
            {receta.codigo}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <IconStethoscope className="h-3.5 w-3.5" />
              {receta.medicoNombre}
            </span>
            <span className="inline-flex items-center gap-1">
              <IconCalendar className="h-3.5 w-3.5" />
              {formatearFecha(receta.fechaEmision)}
            </span>
          </div>
        </div>
        <RecetaPacienteEstadoBadge estado={receta.estado} />
      </header>

      <div className={compacta ? "p-4" : "p-5"}>
        <ul className="space-y-3">
          {receta.items.map((item) => {
            const { dosis, frecuencia } = obtenerDosisYFrecuencia(item);

            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200/80 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.nombreMedicamento}
                    </p>
                    {item.presentacion ? (
                      <p className="text-xs text-slate-500">
                        {item.presentacion}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
                    ×{item.cantidad}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-brand-50/80 px-2.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-700/70">
                      Dosis
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-brand-900">
                      {dosis}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Frecuencia
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                      {frecuencia}
                    </dd>
                  </div>
                </dl>

                {item.indicaciones ? (
                  <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
                    <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {item.indicaciones}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>

        {receta.notas && !compacta ? (
          <p className="mt-3.5 flex items-start gap-1.5 rounded-xl bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900">
            <IconClipboard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            {receta.notas}
          </p>
        ) : null}

        {!compacta ? (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
            <span className="text-xs text-slate-500">Total estimado</span>
            <span className="text-sm font-semibold tabular-nums text-slate-900">
              {formatearMoneda(receta.total)}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
