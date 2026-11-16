import Link from "next/link";
import { Card } from "@/components/ui/card";
import { IconPill } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center py-10">
      <Card className="w-full max-w-md p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <IconPill className="h-7 w-7" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          404
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          Página no encontrada
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link
          href="/paciente"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Ir al inicio
        </Link>
      </Card>
    </div>
  );
}
