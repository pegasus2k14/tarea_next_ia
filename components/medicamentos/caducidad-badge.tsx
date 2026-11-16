import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ESTADO_CADUCIDAD_LABEL } from "@/lib/constants";
import { estadoCaducidad, type EstadoCaducidad } from "@/lib/format";

const META: Record<EstadoCaducidad, BadgeVariant> = {
  caducado: "danger",
  proximo: "warning",
  vigente: "success",
  "sin-fecha": "neutral",
};

/** Badge de vencimiento: avisa cuando un lote caducó o está por caducar. */
export function CaducidadBadge({
  fecha,
  soloAlerta = false,
}: {
  fecha?: string;
  /** Cuando es true, no muestra nada si el lote está vigente. */
  soloAlerta?: boolean;
}) {
  const estado = estadoCaducidad(fecha);
  if (soloAlerta && estado !== "caducado" && estado !== "proximo") {
    return null;
  }

  return (
    <Badge variant={META[estado]} dot>
      {ESTADO_CADUCIDAD_LABEL[estado]}
    </Badge>
  );
}
