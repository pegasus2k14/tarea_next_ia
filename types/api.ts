/**
 * Tipos compartidos por todos los recursos de la API.
 * El contrato completo está documentado en AGENTS.md.
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Envelope estándar de respuesta:
 * { "data": ..., "meta": { ... }, "message": "..." }
 */
export interface ApiEnvelope<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Envelope estándar de error:
 * { "success": false, "error": { "code": "...", "message": "...", "details": ... } }
 */
export interface ApiErrorBody {
  success?: boolean;
  error?: ApiErrorDetail;
  message?: string;
}
