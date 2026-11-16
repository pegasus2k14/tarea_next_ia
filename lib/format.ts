const formatterFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatterMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

/** Formatea una fecha ISO (YYYY-MM-DD) sin desfase por zona horaria. */
export function formatearFecha(iso?: string): string {
  if (!iso) return "—";
  const fecha = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return formatterFecha.format(fecha);
}

export function formatearMoneda(valor: number): string {
  return formatterMoneda.format(valor);
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function calcularEstadoStock(
  stock: number,
  stockMinimo: number,
): "disponible" | "bajo" | "agotado" {
  if (stock <= 0) return "agotado";
  if (stock <= stockMinimo) return "bajo";
  return "disponible";
}
