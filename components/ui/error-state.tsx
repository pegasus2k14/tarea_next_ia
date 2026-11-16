"use client";

import { Button } from "./button";
import { IconAlert, IconRefresh } from "./icons";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-rose-600">
          <IconAlert className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-rose-800">
            No se pudieron cargar los datos
          </p>
          <p className="mt-0.5 text-sm text-rose-700/80">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <IconRefresh className="h-4 w-4" />
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
