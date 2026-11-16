# MediGest

Frontend de un sistema sencillo de **gestión de medicamentos, inventario y
recetas**, construido con Next.js 16 (App Router), TypeScript y Tailwind CSS 4.

El proyecto está listo para consumir una API REST externa, pero incluye un
**modo demo** con datos locales para trabajar sin backend.

## Demo

- **Vista paciente:** `/paciente`
  - Resumen y recetas activas.
  - Catálogo con búsqueda y verificación de stock.
  - Historial de recetas por estado.
- **Vista farmacéutico:** `/admin`
  - Panel con indicadores de inventario y recetas.
  - Inventario con reposición rápida (+20 unidades).
  - Alta de receta y seguimiento de todas las recetas.

La barra superior permite alternar entre ambas vistas (rol simulado). El rol se
guarda en `localStorage` (`medigest.rol`).

## Inicio rápido

```bash
npm install
cp .env.example .env.local   # en Windows: Copy-Item .env.example .env.local
npm run dev
```

Abrir <http://localhost:3000>. La raíz redirige a `/paciente`.

Variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCKS=true
```

- `NEXT_PUBLIC_USE_MOCKS=true` → datos locales (`services/mock-client.ts`).
- `NEXT_PUBLIC_USE_MOCKS=false` → llamadas reales a `NEXT_PUBLIC_API_URL`.

Reinicia el servidor después de cambiar variables `NEXT_PUBLIC_*`.

## Scripts

```bash
npm run dev        # desarrollo (Turbopack)
npm run build      # build de producción
npm run start      # servir build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Estructura

```text
app/          Rutas y layouts (paciente, admin)
components/   UI (layout, providers, primitivas y componentes de dominio)
services/     Cliente HTTP + mocks + contrato ApiClient
types/        Contratos TypeScript de la API
hooks/        useAsync (loading / error / refetch)
lib/          Constantes, formato y utilidades
```

## API

Toda la integración pasa por `services/index.ts`:

```ts
import { api } from "@/services";

const medicamentos = await api.medicamentos.listar({
  search: "amox",
  page: 1,
  limit: 20,
});

const stock = await api.medicamentos.verificarStock("med_amoxicilina", 2);
const recetas = await api.recetas.listarPorUsuario("usr_pac_001");
const nueva = await api.recetas.crear({
  usuarioId: "usr_pac_001",
  medicoNombre: "Dra. Elena Ríos",
  items: [{ medicamentoId: "med_amoxicilina", cantidad: 1 }],
});
```

El contrato completo (endpoints, envelopes, errores, enums y reglas de stock)
está documentado en [`AGENTS.md`](./AGENTS.md).

## Notas

- El cambio de rol es una simulación de UI, **no autenticación real**.
- No hay librerías adicionales de UI, iconos o fetching.
- Los precios se formatean como MXN; ajusta `lib/format.ts` si cambia la moneda.
