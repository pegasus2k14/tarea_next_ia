"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { USUARIO_ACTUAL } from "@/lib/constants";
import type { Rol, Usuario } from "@/types";

const STORAGE_KEY = "medigest.rol";

interface RoleContextValue {
  rol: Rol;
  usuario: Usuario;
  setRol: (rol: Rol) => void;
  isReady: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * Simulación de sesión y roles. NO es un mecanismo de seguridad:
 * cuando exista autenticación real, este provider se reemplaza por
 * la sesión emitida por el backend.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [rol, setRolState] = useState<Rol>("paciente");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(STORAGE_KEY);
      if (guardado === "paciente" || guardado === "farmaceutico") {
        setRolState(guardado);
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  const setRol = useCallback((nuevoRol: Rol) => {
    setRolState(nuevoRol);
    try {
      window.localStorage.setItem(STORAGE_KEY, nuevoRol);
    } catch {
      // El cambio de rol sigue funcionando en memoria.
    }
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      rol,
      usuario: USUARIO_ACTUAL[rol],
      setRol,
      isReady,
    }),
    [rol, setRol, isReady],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole debe usarse dentro de <RoleProvider>.");
  }
  return context;
}
