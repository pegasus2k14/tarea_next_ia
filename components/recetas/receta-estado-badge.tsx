import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ESTADO_RECETA_LABEL } from "@/lib/constants";
import type { EstadoReceta } from "@/types";

const ESTADO_META: Record<EstadoReceta, BadgeVariant> = {
  pendiente: "warning",
  dispensada: "success",
  parcial: "info",
  cancelada: "danger",
};

export function RecetaEstadoBadge({ estado }: { estado: EstadoReceta }) {
  return (
    <Badge variant={ESTADO_META[estado]} dot>
      {ESTADO_RECETA_LABEL[estado]}
    </Badge>
  );
}
