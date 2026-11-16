import type {
  CategoriaMedicamento,
  EstadoReceta,
  EstadoStock,
  Rol,
  Usuario,
} from "@/types";
import type { EstadoCaducidad, EstadoRecetaPaciente } from "@/lib/format";

/**
 * Usuarios de demostración. Cuando exista autenticación real,
 * estos datos se reemplazan por la respuesta de GET /auth/me.
 */
export const USUARIO_ACTUAL: Record<Rol, Usuario> = {
  paciente: {
    id: "usr_pac_001",
    nombre: "Lucía Fernández",
    email: "lucia.fernandez@correo.com",
    rol: "paciente",
    telefono: "+52 55 1234 5678",
  },
  farmaceutico: {
    id: "usr_far_001",
    nombre: "Miguel Torres",
    email: "miguel.torres@medigest.mx",
    rol: "farmaceutico",
  },
};

export const ROL_LABEL: Record<Rol, string> = {
  paciente: "Paciente",
  farmaceutico: "Farmacéutico",
};

export const CATEGORIA_LABEL: Record<CategoriaMedicamento, string> = {
  analgesico: "Analgésico",
  antibiotico: "Antibiótico",
  antiinflamatorio: "Antiinflamatorio",
  cardiovascular: "Cardiovascular",
  respiratorio: "Respiratorio",
  digestivo: "Digestivo",
  antialergico: "Antialérgico",
  otro: "Otro",
};

export const ESTADO_STOCK_LABEL: Record<EstadoStock, string> = {
  disponible: "Disponible",
  bajo: "Stock bajo",
  agotado: "Agotado",
};

export const ESTADO_CADUCIDAD_LABEL: Record<EstadoCaducidad, string> = {
  caducado: "Caducado",
  proximo: "Por caducar",
  vigente: "Vigente",
  "sin-fecha": "Sin fecha",
};

export const ESTADO_RECETA_LABEL: Record<EstadoReceta, string> = {
  pendiente: "Pendiente",
  dispensada: "Dispensada",
  parcial: "Parcial",
  cancelada: "Cancelada",
};

/** Etiquetas simplificadas para la vista del paciente. */
export const ESTADO_RECETA_PACIENTE_LABEL: Record<
  EstadoRecetaPaciente,
  string
> = {
  activo: "Activo",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const ESTADOS_RECETA: EstadoReceta[] = [
  "pendiente",
  "dispensada",
  "parcial",
  "cancelada",
];
