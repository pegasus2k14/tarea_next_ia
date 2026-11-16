import type { PaginationParams } from "./api";

export type Rol = "paciente" | "farmaceutico";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string;
  fechaNacimiento?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  /** Segundos de vigencia del token. */
  expiresIn?: number;
}

export interface PacienteQuery extends PaginationParams {
  search?: string;
}
