import Link from "next/link";
import { IconShield } from "@/components/ui/icons";
import { USE_MOCKS } from "@/services";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex items-center gap-2">
          <IconShield className="h-4 w-4 text-brand-600" />
          MediGest · Base frontend para gestión de medicamentos
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/paciente"
            className="font-medium text-slate-600 transition-colors hover:text-brand-700"
          >
            Vista paciente
          </Link>
          <Link
            href="/admin"
            className="font-medium text-slate-600 transition-colors hover:text-brand-700"
          >
            Vista farmacéutico
          </Link>
          <span className="text-slate-400">
            {USE_MOCKS ? "Modo demo · datos locales" : "Conectado a la API"}
          </span>
        </div>
      </div>
    </footer>
  );
}
