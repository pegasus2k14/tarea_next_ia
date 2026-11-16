import type {
  ApiEnvelope,
  ApiErrorBody,
  CrearMedicamentoRequest,
  CrearRecetaRequest,
  EstadoReceta,
  LoginRequest,
  LoginResponse,
  Medicamento,
  MedicamentoQuery,
  PacienteQuery,
  Paginated,
  PaginationMeta,
  Receta,
  RecetaQuery,
  Usuario,
  VerificacionStock,
} from "@/types";

/* -------------------------------------------------------------------------- */
/* Configuración centralizada                                                 */
/* -------------------------------------------------------------------------- */

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** URL base sin barra final. Se configura en `.env.local`. */
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

/** Activa el adaptador de datos locales mientras no exista backend. */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const TOKEN_KEY = "medigest.token";
const REQUEST_TIMEOUT_MS = 15_000;

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/* -------------------------------------------------------------------------- */
/* Errores                                                                    */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { status?: number; code?: string; details?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? "API_ERROR";
    this.details = options.details;
  }
}

/* -------------------------------------------------------------------------- */
/* Token de autenticación                                                     */
/* -------------------------------------------------------------------------- */

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

/* -------------------------------------------------------------------------- */
/* Cliente HTTP                                                               */
/* -------------------------------------------------------------------------- */

function buildUrl(path: string, query?: QueryParams): string {
  if (!API_BASE_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL no está configurada. Revisa tu archivo .env.local.",
      { code: "CONFIG_ERROR" },
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(`${API_BASE_URL}${normalizedPath}`, origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function requestEnvelope<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, query, headers, signal } = options;
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    const errorName = (error as { name?: string } | null)?.name;
    if (errorName === "TimeoutError" || errorName === "AbortError") {
      throw new ApiError(
        "La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.",
        { code: "TIMEOUT", details: error },
      );
    }
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que la API esté disponible.",
      { code: "NETWORK_ERROR", details: error },
    );
  }

  const text = await response.text();
  const payload = text ? parseJson(text) : null;

  if (!response.ok) {
    const errorBody = (payload ?? {}) as ApiErrorBody;
    throw new ApiError(
      errorBody.error?.message ??
        errorBody.message ??
        `La API respondió con el estado ${response.status}.`,
      {
        status: response.status,
        code: errorBody.error?.code ?? "HTTP_ERROR",
        details: errorBody.error?.details,
      },
    );
  }

  if (payload === null) {
    return { data: undefined as T };
  }

  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return payload as ApiEnvelope<T>;
  }

  // Tolerancia para backends que devuelven el recurso sin envelope.
  return { data: payload as T };
}

async function request<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const envelope = await requestEnvelope<T>(path, options);
  return envelope.data;
}

async function requestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  const envelope = await requestEnvelope<T[]>(path, options);
  const items = Array.isArray(envelope.data) ? envelope.data : [];
  const page = Number(options.query?.page ?? envelope.meta?.page ?? 1);
  const limit = Number(options.query?.limit ?? envelope.meta?.limit ?? 20);
  const total = envelope.meta?.total ?? items.length;

  const meta: PaginationMeta = envelope.meta ?? {
    page,
    limit,
    total,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };

  return { items, meta };
}

/* -------------------------------------------------------------------------- */
/* Contrato del cliente                                                       */
/* -------------------------------------------------------------------------- */

export interface ApiClient {
  auth: {
    login(credentials: LoginRequest): Promise<LoginResponse>;
    me(): Promise<Usuario>;
    logout(): Promise<void>;
  };
  medicamentos: {
    listar(params?: MedicamentoQuery): Promise<Paginated<Medicamento>>;
    obtener(id: string): Promise<Medicamento>;
    crear(payload: CrearMedicamentoRequest): Promise<Medicamento>;
    verificarStock(id: string, cantidad: number): Promise<VerificacionStock>;
    actualizarStock(id: string, stock: number): Promise<Medicamento>;
  };
  recetas: {
    crear(payload: CrearRecetaRequest): Promise<Receta>;
    listarPorUsuario(
      usuarioId: string,
      params?: RecetaQuery,
    ): Promise<Paginated<Receta>>;
    listar(params?: RecetaQuery): Promise<Paginated<Receta>>;
    obtener(id: string): Promise<Receta>;
    /**
     * Cambia el estado de una receta. `dispensada` descuenta stock
     * (PATCH /recetas/:id/dispensar); el resto usa PATCH /recetas/:id/estado.
     */
    actualizarEstado(id: string, estado: EstadoReceta): Promise<Receta>;
  };
  pacientes: {
    listar(params?: PacienteQuery): Promise<Paginated<Usuario>>;
  };
}

/* -------------------------------------------------------------------------- */
/* Implementación HTTP real                                                   */
/* -------------------------------------------------------------------------- */

export const apiClient: ApiClient = {
  auth: {
    async login(credentials) {
      const response = await request<LoginResponse>("/auth/login", {
        method: "POST",
        body: credentials,
      });
      if (response?.token) setAuthToken(response.token);
      return response;
    },
    me() {
      return request<Usuario>("/auth/me");
    },
    async logout() {
      try {
        await request<void>("/auth/logout", { method: "POST" });
      } finally {
        clearAuthToken();
      }
    },
  },

  medicamentos: {
    listar(params = {}) {
      const { soloDisponibles, ...query } = params;
      return requestPaginated<Medicamento>("/medicamentos", {
        query: {
          ...query,
          ...(soloDisponibles ? { estado: "disponible" } : {}),
        },
      });
    },
    obtener(id) {
      return request<Medicamento>(`/medicamentos/${encodeURIComponent(id)}`);
    },
    crear(payload) {
      return request<Medicamento>("/medicamentos", {
        method: "POST",
        body: payload,
      });
    },
    verificarStock(id, cantidad) {
      return request<VerificacionStock>(
        `/medicamentos/${encodeURIComponent(id)}/stock`,
        { query: { cantidad } },
      );
    },
    actualizarStock(id, stock) {
      return request<Medicamento>(
        `/medicamentos/${encodeURIComponent(id)}/stock`,
        { method: "PATCH", body: { stock } },
      );
    },
  },

  recetas: {
    crear(payload) {
      return request<Receta>("/recetas", { method: "POST", body: payload });
    },
    listarPorUsuario(usuarioId, params = {}) {
      return requestPaginated<Receta>("/recetas", {
        query: { ...params, usuarioId },
      });
    },
    listar(params = {}) {
      return requestPaginated<Receta>("/recetas", { query: { ...params } });
    },
    obtener(id) {
      return request<Receta>(`/recetas/${encodeURIComponent(id)}`);
    },
    actualizarEstado(id, estado) {
      const path = `/recetas/${encodeURIComponent(id)}`;
      if (estado === "dispensada") {
        return request<Receta>(`${path}/dispensar`, { method: "PATCH" });
      }
      return request<Receta>(`${path}/estado`, {
        method: "PATCH",
        body: { estado },
      });
    },
  },

  pacientes: {
    listar(params = {}) {
      return requestPaginated<Usuario>("/pacientes", {
        query: { ...params },
      });
    },
  },
};
