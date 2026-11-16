import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ESTADO_RECETA_PACIENTE_LABEL } from "@/lib/constants";
import {
  estadoRecetaPaciente,
  type EstadoRecetaPaciente,
} from "@/lib/format";
import type { EstadoReceta } from "@/types";

const META: Record<EstadoRecetaPaciente, BadgeVariant> = {
  activo: "brand",
  completado: "success",
  cancelado: "neutral",
};

/** Estado de la receta en lenguaje del paciente: Activo, Completado o Cancelado. */
export function RecetaPacienteEstadoBadge({
  estado,
}: {
  estado: EstadoReceta;
}) {
  const simplificado = estadoRecetaPaciente(estado);
  return (
    <Badge variant={META[simplificado]} dot>
      {ESTADO_RECETA_PACIENTE_LABEL[simplificado]}
    </Badge>
  );
}
