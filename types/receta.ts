import type { PaginationParams } from "./api";

export type EstadoReceta = "pendiente" | "dispensada" | "parcial" | "cancelada";

export interface RecetaItem {
  id: string;
  medicamentoId: string;
  nombreMedicamento: string;
  presentacion?: string;
  cantidad: number;
  precioUnitario: number;
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
  indicaciones?: string;
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
