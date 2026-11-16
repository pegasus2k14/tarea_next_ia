import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ESTADO_STOCK_LABEL } from "@/lib/constants";
import type { EstadoStock } from "@/types";

const ESTADO_META: Record<
  EstadoStock,
  { variant: BadgeVariant; className: string }
> = {
  disponible: { variant: "success", className: "" },
  bajo: { variant: "warning", className: "" },
  agotado: { variant: "danger", className: "" },
};

export function StockBadge({ estado }: { estado: EstadoStock }) {
  const meta = ESTADO_META[estado];
  return (
    <Badge variant={meta.variant} dot>
      {ESTADO_STOCK_LABEL[estado]}
    </Badge>
  );
}
