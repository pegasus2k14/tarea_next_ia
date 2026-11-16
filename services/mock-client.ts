import { calcularEstadoStock } from "@/lib/format";
import type {
  Medicamento,
  Paginated,
  PaginationParams,
  Receta,
  RecetaItem,
  Usuario,
} from "@/types";
import {
  ApiError,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
  type ApiClient,
} from "./api";
import { mockMedicamentos, mockRecetas, mockUsuarios } from "./mock-data";

/**
 * Adaptador de datos locales con la misma interfaz que `apiClient`.
 * Permite desarrollar la UI antes de que exista el backend.
 * Se activa con NEXT_PUBLIC_USE_MOCKS=true.
 */

const LATENCIA_MS = 320;

const medicamentos: Medicamento[] = mockMedicamentos.map((item) => ({
  ...item,
}));

const recetas: Receta[] = mockRecetas.map((receta) => ({
  ...receta,
  items: receta.items.map((item) => ({ ...item })),
}));

const usuarios: Usuario[] = mockUsuarios.map((usuario) => ({ ...usuario }));

function esperar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));
}

function normalizar(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function paginar<T>(items: T[], params: PaginationParams = {}): Paginated<T> {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.max(1, Number(params.limit ?? 20));
  const total = items.length;

  return {
    items: items.slice((page - 1) * limit, page * limit),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function buscarMedicamento(id: string): Medicamento {
  const medicamento = medicamentos.find((item) => item.id === id);
  if (!medicamento) {
    throw new ApiError("El medicamento solicitado no existe.", {
      status: 404,
      code: "MEDICAMENTO_NOT_FOUND",
    });
  }
  return medicamento;
}

function filtrarRecetas(params: {
  usuarioId?: string;
  estado?: Receta["estado"];
  search?: string;
}): Receta[] {
  const search = normalizar(params.search ?? "");

  return recetas
    .filter((receta) => {
      if (params.usuarioId && receta.usuarioId !== params.usuarioId) return false;
      if (params.estado && receta.estado !== params.estado) return false;
      if (!search) return true;

      const texto = normalizar(
        [
          receta.codigo,
          receta.pacienteNombre,
          receta.medicoNombre,
          ...receta.items.map((item) => item.nombreMedicamento),
        ].join(" "),
      );
      return texto.includes(search);
    })
    .sort((a, b) => b.fechaEmision.localeCompare(a.fechaEmision));
}

export const mockClient: ApiClient = {
  auth: {
    async login(credentials) {
      await esperar();
      if (!credentials.email || credentials.password.length < 6) {
        throw new ApiError("Credenciales inválidas.", {
          status: 401,
          code: "INVALID_CREDENTIALS",
        });
      }

      const usuario = usuarios.find(
        (item) =>
          item.email.toLowerCase() === credentials.email.toLowerCase() &&
          item.rol !== "paciente",
      ) ?? usuarios[0];

      const token = `mock.${usuario.rol}.${usuario.id}`;
      setAuthToken(token);

      return { token, usuario, expiresIn: 3600 };
    },

    async me() {
      await esperar();
      const token = getAuthToken();
      if (!token) {
        throw new ApiError("No hay una sesión activa.", {
          status: 401,
          code: "NO_AUTH",
        });
      }

      const usuarioId = token.split(".").at(-1);
      const usuario = usuarios.find((item) => item.id === usuarioId);
      if (!usuario) {
        throw new ApiError("La sesión ya no es válida.", {
          status: 401,
          code: "INVALID_TOKEN",
        });
      }
      return usuario;
    },

    async logout() {
      await esperar();
      clearAuthToken();
    },
  },

  medicamentos: {
    async listar(params = {}) {
      await esperar();
      const search = normalizar(params.search ?? "");
      let resultado = [...medicamentos];

      if (search) {
        resultado = resultado.filter((item) =>
          normalizar(
            `${item.nombre} ${item.principioActivo} ${item.laboratorio} ${item.presentacion}`,
          ).includes(search),
        );
      }
      if (params.categoria) {
        resultado = resultado.filter(
          (item) => item.categoria === params.categoria,
        );
      }
      if (params.estado) {
        resultado = resultado.filter((item) => item.estado === params.estado);
      }
      if (params.soloDisponibles) {
        resultado = resultado.filter((item) => item.estado === "disponible");
      }

      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      return paginar(resultado, params);
    },

    async obtener(id) {
      await esperar();
      return { ...buscarMedicamento(id) };
    },

    async verificarStock(id, cantidad) {
      await esperar();
      const medicamento = buscarMedicamento(id);
      const cantidadSolicitada = Math.floor(cantidad);

      if (!Number.isFinite(cantidadSolicitada) || cantidadSolicitada <= 0) {
        throw new ApiError("La cantidad debe ser mayor a cero.", {
          status: 400,
          code: "VALIDATION_ERROR",
        });
      }

      const disponible = medicamento.stock >= cantidadSolicitada;
      return {
        medicamentoId: medicamento.id,
        nombre: medicamento.nombre,
        cantidadSolicitada,
        stockActual: medicamento.stock,
        disponible,
        estado: medicamento.estado,
        mensaje: disponible
          ? `Hay existencias suficientes: ${medicamento.stock} unidades disponibles.`
          : `Solo quedan ${medicamento.stock} unidades y solicitaste ${cantidadSolicitada}.`,
      };
    },

    async actualizarStock(id, stock) {
      await esperar();
      const medicamento = buscarMedicamento(id);
      const nuevoStock = Math.floor(stock);

      if (!Number.isFinite(nuevoStock) || nuevoStock < 0) {
        throw new ApiError("El stock no puede ser negativo.", {
          status: 400,
          code: "VALIDATION_ERROR",
        });
      }

      medicamento.stock = nuevoStock;
      medicamento.estado = calcularEstadoStock(
        nuevoStock,
        medicamento.stockMinimo,
      );
      medicamento.actualizadoEn = new Date().toISOString();
      return { ...medicamento };
    },
  },

  recetas: {
    async crear(payload) {
      await esperar();

      const paciente = usuarios.find(
        (item) => item.id === payload.usuarioId && item.rol === "paciente",
      );
      if (!paciente) {
        throw new ApiError("El paciente indicado no existe.", {
          status: 404,
          code: "PACIENTE_NOT_FOUND",
        });
      }
      if (!payload.medicoNombre?.trim()) {
        throw new ApiError("El nombre del médico es obligatorio.", {
          status: 400,
          code: "VALIDATION_ERROR",
        });
      }
      if (!payload.items?.length) {
        throw new ApiError("La receta debe incluir al menos un medicamento.", {
          status: 400,
          code: "VALIDATION_ERROR",
        });
      }

      const items: RecetaItem[] = payload.items.map((item, index) => {
        const medicamento = buscarMedicamento(item.medicamentoId);
        const cantidad = Math.floor(item.cantidad);

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
          throw new ApiError(
            `La cantidad de ${medicamento.nombre} debe ser mayor a cero.`,
            { status: 400, code: "VALIDATION_ERROR" },
          );
        }
        if (medicamento.stock < cantidad) {
          throw new ApiError(
            `Stock insuficiente de ${medicamento.nombre}. Disponibles: ${medicamento.stock}.`,
            { status: 409, code: "STOCK_INSUFICIENTE" },
          );
        }

        return {
          id: `rit_${Date.now()}_${index}`,
          medicamentoId: medicamento.id,
          nombreMedicamento: medicamento.nombre,
          presentacion: medicamento.presentacion,
          cantidad,
          precioUnitario: medicamento.precio,
          indicaciones: item.indicaciones?.trim() || undefined,
          dispensada: false,
        };
      });

      const total = items.reduce(
        (suma, item) => suma + item.precioUnitario * item.cantidad,
        0,
      );
      const receta: Receta = {
        id: `rec_${Date.now()}`,
        codigo: `RX-2026-${String(417 + recetas.length).padStart(4, "0")}`,
        usuarioId: paciente.id,
        pacienteNombre: paciente.nombre,
        medicoNombre: payload.medicoNombre.trim(),
        fechaEmision: new Date().toISOString().slice(0, 10),
        estado: "pendiente",
        items,
        notas: payload.notas?.trim() || undefined,
        total,
      };

      recetas.unshift(receta);
      return { ...receta, items: receta.items.map((item) => ({ ...item })) };
    },

    async listarPorUsuario(usuarioId, params = {}) {
      await esperar();
      return paginar(
        filtrarRecetas({
          usuarioId,
          estado: params.estado,
          search: params.search,
        }),
        params,
      );
    },

    async listar(params = {}) {
      await esperar();
      return paginar(
        filtrarRecetas({
          estado: params.estado,
          search: params.search,
        }),
        params,
      );
    },

    async obtener(id) {
      await esperar();
      const receta = recetas.find((item) => item.id === id);
      if (!receta) {
        throw new ApiError("La receta solicitada no existe.", {
          status: 404,
          code: "RECETA_NOT_FOUND",
        });
      }
      return { ...receta, items: receta.items.map((item) => ({ ...item })) };
    },
  },

  pacientes: {
    async listar(params = {}) {
      await esperar();
      const search = normalizar(params.search ?? "");
      const resultado = usuarios
        .filter((usuario) => usuario.rol === "paciente")
        .filter((usuario) =>
          search
            ? normalizar(`${usuario.nombre} ${usuario.email}`).includes(search)
            : true,
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

      return paginar(resultado, params);
    },
  },
};
