import { USE_MOCKS, apiClient, type ApiClient } from "./api";
import { mockClient } from "./mock-client";

/**
 * Punto único de acceso a datos para la UI.
 *
 * - Con NEXT_PUBLIC_USE_MOCKS=true devuelve datos locales.
 * - En caso contrario usa `services/api.ts` contra NEXT_PUBLIC_API_URL.
 */
export const api: ApiClient = USE_MOCKS ? mockClient : apiClient;

export { API_BASE_URL, ApiError, USE_MOCKS } from "./api";
export type { ApiClient } from "./api";
