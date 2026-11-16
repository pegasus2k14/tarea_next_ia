"use client";

import { useCallback, useEffect, useState } from "react";

interface Resultado<T> {
  key: string;
  data: T | null;
  error: Error | null;
}

/**
 * Hook mínimo para consumir los servicios desde Client Components.
 * La UI no llama a `fetch` directamente: siempre pasa por `services`.
 *
 * El estado se etiqueta con una clave derivada de las dependencias para
 * calcular `loading` sin encadenar renders desde el efecto.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
) {
  const [reloadKey, setReloadKey] = useState(0);
  const key = `${JSON.stringify(deps)}::${reloadKey}`;
  const [resultado, setResultado] = useState<Resultado<T>>({
    key: "",
    data: null,
    error: null,
  });

  const reload = useCallback(() => {
    setReloadKey((actual) => actual + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((data) => {
        if (!cancelled) setResultado({ key, data, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setResultado({
            key,
            data: null,
            error:
              error instanceof Error
                ? error
                : new Error("Ocurrió un error inesperado."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // El loader se recrea en cada render; la clave resume sus dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const vigente = resultado.key === key;

  return {
    data: vigente ? resultado.data : null,
    error: vigente ? resultado.error : null,
    loading: !vigente,
    reload,
  };
}
