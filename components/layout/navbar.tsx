"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import { useRole } from "@/components/providers/role-provider";
import { Badge } from "@/components/ui/badge";
import {
  IconBoxes,
  IconClipboard,
  IconGrid,
  IconMenu,
  IconPill,
  IconStethoscope,
  IconUser,
  IconX,
} from "@/components/ui/icons";
import { ROL_LABEL } from "@/lib/constants";
import { iniciales } from "@/lib/format";
import { cn } from "@/lib/utils";
import { USE_MOCKS } from "@/services";
import type { Rol } from "@/types";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: string;
  icon: IconComponent;
}

const NAV_ITEMS: Record<Rol, NavItem[]> = {
  paciente: [
    { href: "/paciente", label: "Resumen", icon: IconGrid },
    { href: "/paciente/medicamentos", label: "Medicamentos", icon: IconPill },
    { href: "/paciente/recetas", label: "Mis recetas", icon: IconClipboard },
  ],
  farmaceutico: [
    { href: "/admin", label: "Resumen", icon: IconGrid },
    { href: "/admin/inventario", label: "Inventario", icon: IconBoxes },
    { href: "/admin/recetas", label: "Recetas", icon: IconClipboard },
  ],
};

const ROL_HOME: Record<Rol, string> = {
  paciente: "/paciente",
  farmaceutico: "/admin",
};

function esRutaActiva(pathname: string, item: NavItem, rol: Rol): boolean {
  if (item.href === ROL_HOME[rol]) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { rol, usuario, setRol } = useRole();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const items = NAV_ITEMS[rol];

  function cambiarRol(nuevoRol: Rol) {
    if (nuevoRol === rol) {
      setMenuAbierto(false);
      return;
    }
    setRol(nuevoRol);
    setMenuAbierto(false);
    router.push(ROL_HOME[nuevoRol]);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={ROL_HOME[rol]}
          onClick={() => setMenuAbierto(false)}
          className="flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          aria-label="MediGest, ir al inicio"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 text-white shadow-md shadow-brand-700/20">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="hidden sm:block">
            <span className="block text-[15px] font-bold tracking-tight text-slate-900">
              MediGest
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Gestión de medicamentos
            </span>
          </span>
        </Link>

        <nav className="ml-5 hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {items.map((item) => {
            const activo = esRutaActiva(pathname, item, rol);
            const Icono = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  activo
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icono className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {USE_MOCKS ? (
            <Badge variant="warning" dot className="hidden xl:inline-flex">
              Datos demo
            </Badge>
          ) : null}

          <div
            className="hidden rounded-xl bg-slate-100 p-1 lg:flex"
            role="group"
            aria-label="Cambiar vista"
          >
            <button
              type="button"
              onClick={() => cambiarRol("paciente")}
              aria-pressed={rol === "paciente"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                rol === "paciente"
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <IconUser className="h-3.5 w-3.5" />
              Paciente
            </button>
            <button
              type="button"
              onClick={() => cambiarRol("farmaceutico")}
              aria-pressed={rol === "farmaceutico"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                rol === "farmaceutico"
                  ? "bg-white text-brand-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <IconStethoscope className="h-3.5 w-3.5" />
              Farmacéutico
            </button>
          </div>

          <div className="ml-1 hidden items-center gap-2.5 border-l border-slate-200 pl-3 lg:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-teal-100 text-xs font-bold text-brand-800 ring-1 ring-brand-200">
              {iniciales(usuario.nombre)}
            </span>
            <span className="hidden xl:block">
              <span className="block max-w-36 truncate text-xs font-semibold text-slate-800">
                {usuario.nombre}
              </span>
              <span className="block text-[11px] text-slate-500">
                {ROL_LABEL[usuario.rol]}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:hidden"
          >
            {menuAbierto ? (
              <IconX className="h-5 w-5" />
            ) : (
              <IconMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuAbierto ? (
        <div
          id="menu-movil"
          className="border-t border-slate-200/70 bg-white px-4 pb-5 pt-3 sm:px-6 lg:hidden"
        >
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-800 ring-1 ring-brand-200">
              {iniciales(usuario.nombre)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {usuario.nombre}
              </p>
              <p className="text-xs text-slate-500">{ROL_LABEL[usuario.rol]}</p>
            </div>
            {USE_MOCKS ? (
              <Badge variant="warning" className="ml-auto">
                Demo
              </Badge>
            ) : null}
          </div>

          <nav className="space-y-1" aria-label="Navegación móvil">
            {items.map((item) => {
              const activo = esRutaActiva(pathname, item, rol);
              const Icono = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuAbierto(false)}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    activo
                      ? "bg-brand-50 text-brand-800"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icono className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Cambiar vista
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cambiarRol("paciente")}
              aria-pressed={rol === "paciente"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors",
                rol === "paciente"
                  ? "border-brand-200 bg-brand-50 text-brand-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              <IconUser className="h-4 w-4" />
              Paciente
            </button>
            <button
              type="button"
              onClick={() => cambiarRol("farmaceutico")}
              aria-pressed={rol === "farmaceutico"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors",
                rol === "farmaceutico"
                  ? "border-brand-200 bg-brand-50 text-brand-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              <IconStethoscope className="h-4 w-4" />
              Farmacéutico
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
