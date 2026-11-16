import type { PaginationParams } from "./api";

export type CategoriaMedicamento =
  | "analgesico"
  | "antibiotico"
  | "antiinflamatorio"
  | "cardiovascular"
  | "respiratorio"
  | "digestivo"
  | "antialergico"
  | "otro";

export type EstadoStock = "disponible" | "bajo" | "agotado";

export interface Medicamento {
  id: string;
  nombre: string;
  principioActivo: string;
  /** Presentación comercial, por ejemplo "Tableta 500 mg". */
  presentacion: string;
  laboratorio: string;
  categoria: CategoriaMedicamento;
  /** Precio unitario en MXN. */
  precio: number;
  stock: number;
  stockMinimo: number;
  requiereReceta: boolean;
  lote?: string;
  /** Fecha ISO (YYYY-MM-DD). */
  fechaVencimiento?: string;
  estado: EstadoStock;
  actualizadoEn?: string;
}

/** Datos para registrar un medicamento o un nuevo lote en el catálogo. */
export interface CrearMedicamentoRequest {
  nombre: string;
  principioActivo: string;
  presentacion: string;
  laboratorio: string;
  categoria: CategoriaMedicamento;
  precio: number;
  stock: number;
  stockMinimo: number;
  requiereReceta: boolean;
  lote?: string;
  /** Fecha ISO (YYYY-MM-DD). */
  fechaVencimiento?: string;
}

export interface MedicamentoQuery extends PaginationParams {
  search?: string;
  categoria?: CategoriaMedicamento;
  estado?: EstadoStock;
  soloDisponibles?: boolean;
}

export interface VerificacionStock {
  medicamentoId: string;
  nombre: string;
  cantidadSolicitada: number;
  stockActual: number;
  disponible: boolean;
  estado: EstadoStock;
  mensaje: string;
}
