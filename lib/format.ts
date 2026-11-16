import type { EstadoReceta } from "@/types";

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

export type EstadoCaducidad = "caducado" | "proximo" | "vigente" | "sin-fecha";

/** Días restantes antes del vencimiento. Negativo si ya caducó. */
export function diasParaCaducar(iso?: string): number | null {
  if (!iso) return null;
  const vencimiento = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(vencimiento.getTime())) return null;

  const hoy = new Date();
  const inicioHoy = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
    12,
    0,
    0,
  );
  return Math.round(
    (vencimiento.getTime() - inicioHoy.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Clasifica el vencimiento de un lote. Se considera "próximo" cuando faltan
 * 90 días o menos para la fecha de caducidad.
 */
export function estadoCaducidad(iso?: string): EstadoCaducidad {
  const dias = diasParaCaducar(iso);
  if (dias === null) return "sin-fecha";
  if (dias < 0) return "caducado";
  if (dias <= 90) return "proximo";
  return "vigente";
}

export function calcularEstadoStock(
  stock: number,
  stockMinimo: number,
): "disponible" | "bajo" | "agotado" {
  if (stock <= 0) return "agotado";
  if (stock <= stockMinimo) return "bajo";
  return "disponible";
}

/* -------------------------------------------------------------------------- */
/* Presentación para pacientes                                                */
/* -------------------------------------------------------------------------- */

/** Estado de la receta en lenguaje del paciente. */
export type EstadoRecetaPaciente = "activo" | "completado" | "cancelado";

export function estadoRecetaPaciente(
  estado: EstadoReceta,
): EstadoRecetaPaciente {
  if (estado === "dispensada") return "completado";
  if (estado === "cancelada") return "cancelado";
  return "activo";
}

const NUMEROS: Record<string, string> = {
  un: "1",
  una: "1",
  uno: "1",
  dos: "2",
  tres: "3",
  cuatro: "4",
};

const PATRONES_FRECUENCIA: Array<[RegExp, (match: RegExpMatchArray) => string]> =
  [
    [/cada\s+(\d+)\s+horas?/i, (m) => `Cada ${m[1]} horas`],
    [/(\d+)\s+veces?\s+al\s+d[ií]a/i, (m) => `${m[1]} veces al día`],
    [
      /con\s+el\s+desayuno\s+y\s+(?:otra\s+)?con\s+la\s+cena/i,
      () => "Desayuno y cena",
    ],
    [/en\s+ayunas/i, () => "En ayunas"],
    [/por\s+la\s+noche/i, () => "Por la noche"],
    [/al\s+d[ií]a/i, () => "Una vez al día"],
    [/seg[uú]n\s+esquema/i, () => "Según esquema"],
  ];

const PATRONES_DOSIS: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [
    /(\d+|un|una|uno|dos|tres|cuatro)\s+(c[áa]psulas?|tabletas?|pastillas?|inhalaciones?|aplicaciones?|dosis)/i,
    (m) => {
      const numero = NUMEROS[m[1].toLowerCase()] ?? m[1];
      return `${numero} ${m[2].toLowerCase()}`;
    },
  ],
  [
    /aplicar\s+([^,.;]+)/i,
    (m) => `Aplicar ${m[1].trim()}`,
  ],
];

/**
 * Extrae dosis y frecuencia de un texto libre de indicaciones.
 * Se usa como respaldo cuando la API no devuelve los campos estructurados.
 */
export function interpretarIndicaciones(indicaciones?: string): {
  dosis?: string;
  frecuencia?: string;
} {
  if (!indicaciones) return {};

  let frecuencia: string | undefined;
  for (const [patron, construir] of PATRONES_FRECUENCIA) {
    const match = indicaciones.match(patron);
    if (match) {
      frecuencia = construir(match);
      break;
    }
  }

  let dosis: string | undefined;
  for (const [patron, construir] of PATRONES_DOSIS) {
    const match = indicaciones.match(patron);
    if (match) {
      dosis = construir(match);
      break;
    }
  }

  return { dosis, frecuencia };
}

/** Dosis y frecuencia listas para mostrar, con respaldo claro. */
export function obtenerDosisYFrecuencia(item: {
  dosis?: string;
  frecuencia?: string;
  indicaciones?: string;
}): { dosis: string; frecuencia: string } {
  const interpretado = interpretarIndicaciones(item.indicaciones);
  return {
    dosis: item.dosis?.trim() || interpretado.dosis || "Según indicación",
    frecuencia:
      item.frecuencia?.trim() || interpretado.frecuencia || "Según indicación",
  };
}
