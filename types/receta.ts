import type { PaginationParams } from "./api";

export type EstadoReceta = "pendiente" | "dispensada" | "parcial" | "cancelada";

export interface RecetaItem {
  id: string;
  medicamentoId: string;
  nombreMedicamento: string;
  presentacion?: string;
  cantidad: number;
  precioUnitario: number;
  /** Dosis legible para el paciente, por ejemplo "1 tableta". */
  dosis?: string;
  /** Frecuencia legible, por ejemplo "Cada 8 horas". */
  frecuencia?: string;
  indicaciones?: string;
  dispensada: boolean;
}

export interface Receta {
  id: string;
  /** Folio legible para el paciente, por ejemplo "RX-2026-0412". */
  codigo: string;
  usuarioId: string;
  pacienteNombre: string;
  medicoNombre: string;
  /** Fecha ISO (YYYY-MM-DD). */
  fechaEmision: string;
  estado: EstadoReceta;
  items: RecetaItem[];
  notas?: string;
  total: number;
}

export interface CrearRecetaItem {
  medicamentoId: string;
  cantidad: number;
  /** Opcionales: la UI también las compone dentro de `indicaciones`. */
  dosis?: string;
  frecuencia?: string;
  indicaciones?: string;
}

/** Cambio de estado solicitado por el farmacéutico. */
export interface ActualizarEstadoRecetaRequest {
  estado: EstadoReceta;
}

export interface CrearRecetaRequest {
  usuarioId: string;
  medicoNombre: string;
  items: CrearRecetaItem[];
  notas?: string;
}

export interface RecetaQuery extends PaginationParams {
  estado?: EstadoReceta;
  /** Búsqueda por folio, paciente o médico. */
  search?: string;
}
