<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — MediGest

Guía de trabajo para desarrolladores y agentes de IA que colaboren en este
repositorio. Describe el stack, las convenciones, la estructura y el contrato
esperado de la API REST.

## 1. Resumen del proyecto

MediGest es el frontend base de un sistema sencillo de gestión de medicamentos.
Incluye dos vistas:

- **Paciente:** resumen, recetas activas con dosis y frecuencia, catálogo de
  medicamentos, verificación de stock e historial de recetas.
- **Farmacéutico/Administrador:** panel de inventario, reabastecimiento y
  creación/seguimiento de recetas.

El backend aún no existe. La aplicación funciona con un **adaptador de datos
locales** (`NEXT_PUBLIC_USE_MOCKS=true`) y está preparada para conectarse a una
API REST externa cambiando una variable de entorno y desactivando los mocks.

> El cambio de rol es **simulado** y no constituye un mecanismo de seguridad.
> No protege datos ni rutas en producción.

## 2. Tecnologías

| Tecnología   | Versión | Uso                                              |
| ------------ | ------- | ------------------------------------------------ |
| Next.js      | 16.4.x  | App Router, Server/Client Components, Turbopack  |
| React        | 19.3.x  | UI e interacciones                               |
| TypeScript   | 5.x     | Tipado estricto (`strict: true`)                 |
| Tailwind CSS | 4.3.x   | Estilos utilitarios y tokens de diseño           |
| ESLint       | 9.x     | Reglas de Next.js + React Hooks                  |

No se usan librerías de UI, iconos, estado global ni fetching adicionales: los
iconos son SVG propios, el estado de rol vive en un Context y los datos se
consumen con `fetch` a través de `services/api.ts`.

## 3. Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo (Turbopack)
npm run build        # build de producción (Turbopack)
npm run start        # servir el build
npm run lint         # ESLint (flat config)
npm run typecheck    # tsc --noEmit
```

Antes de entregar cambios, los tres últimos comandos deben pasar sin errores.

## 4. Estructura de carpetas

```text
.
├── app/                            # Solo rutas, layouts y estilos globales
│   ├── layout.tsx                  # Layout raíz: providers, navbar, footer
│   ├── page.tsx                    # Redirige a /paciente
│   ├── globals.css                 # Tailwind + tokens de diseño
│   ├── icon.svg                    # Favicon
│   ├── not-found.tsx
│   ├── paciente/
│   │   ├── layout.tsx              # Guard de rol simulado (paciente)
│   │   ├── page.tsx                # Resumen del paciente
│   │   ├── medicamentos/page.tsx   # Catálogo + verificación de stock
│   │   └── recetas/page.tsx        # Recetas del usuario actual
│   └── admin/
│       ├── layout.tsx              # Guard de rol simulado
│       ├── page.tsx                # Panel de farmacia
│       ├── inventario/page.tsx     # Inventario y reposición
│       └── recetas/page.tsx        # Todas las recetas + alta de receta
├── components/
│   ├── layout/                     # Navbar y footer
│   ├── providers/                  # RoleProvider (sesión simulada)
│   ├── ui/                         # Primitivas: Button, Card, Badge, Modal, Input…
│   ├── medicamentos/               # Tabla, badges, alta y verificador de stock
│   └── recetas/                    # Tarjeta de paciente, badges y formulario
├── services/
│   ├── api.ts                      # Cliente HTTP real + contrato ApiClient
│   ├── mock-client.ts              # Implementación local del contrato
│   ├── mock-data.ts                # Datos de demostración
│   └── index.ts                    # Selecciona mock o API real
├── hooks/
│   └── use-async.ts                # Carga/error/refetch para Client Components
├── lib/
│   ├── constants.ts                # Usuarios demo, etiquetas, enums de UI
│   ├── format.ts                   # Fechas, moneda, iniciales, estado de stock
│   └── utils.ts                    # cn(), normalizarTexto()
├── types/
│   ├── api.ts                      # Paginación, envelopes, errores
│   ├── auth.ts                     # Usuario, Rol, login
│   ├── medicamento.ts              # Medicamento, stock, filtros
│   ├── receta.ts                   # Receta, items, creación, filtros
│   └── index.ts                    # Re-exportaciones
├── .env.example                    # Variables documentadas (sí se versiona)
├── .env.local                      # Variables locales (ignorado por git)
├── AGENTS.md
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

### Reglas de dependencia

```text
app/*  →  components/*  →  hooks/*, lib/*
app/*  →  services/*   →  types/*
components/*  →  types/*, lib/*        (nunca importan services/api.ts directo)
```

- `app/` solo compone rutas y layouts. No contiene lógica de negocio ni `fetch`.
- `components/ui/` son primitivas reutilizables y agnósticas del dominio.
- `services/` no importa React. Toda llamada HTTP vive ahí.
- `types/` no importa nada de la app; son contratos puros.
- `lib/` contiene funciones puras y constantes de presentación.

## 5. Convenciones de código

### TypeScript

- `strict: true`; evitar `any` y aserciones innecesarias.
- Preferir `interface` para contratos públicos y `type` para uniones/alias.
- Los imports usan el alias `@/*` (por ejemplo `import { api } from "@/services"`).
- Usar `import type` cuando solo se importan tipos.
- Fechas en ISO (`YYYY-MM-DD`); dinero como `number` (MXN) y formateado solo en UI.
- No duplicar tipos de la API en componentes: importarlos desde `/types`.

### Componentes

- Server Components por defecto; agregar `"use client"` solo si hay estado,
  efectos, eventos o APIs del navegador.
- Archivos en **kebab-case** (`receta-form.tsx`); componentes en **PascalCase**.
- Un componente por archivo; props tipadas inline o con `interface` exportada.
- Los componentes de dominio reciben datos por props; no conocen la forma de la
  API más allá de los tipos.
- Usar los componentes de `components/ui` antes de crear nuevos estilos.
- Toda la copia de UI está en **español**.

### Datos

- La UI **nunca** llama `fetch` directamente. Importar `api` desde `@/services`.
- Toda respuesta se tipa con los contratos de `/types`.
- Manejar siempre tres estados: `loading` (Skeleton), `error` (ErrorState) y
  `vacío` (EmptyState).
- Las mutaciones deben refrescar los datos con `reload()` del hook `useAsync`.
- No silenciar errores: mostrar el `message` de `ApiError` al usuario.

### Estilos (Tailwind 4)

- Tokens en `app/globals.css` (`@theme`): paleta `brand`, `canvas`, `shadow-card`.
- Preferir clases semánticas: `bg-brand-700`, `text-slate-500`, `rounded-2xl`.
- Evitar colores hex sueltos en componentes; si hace falta un token nuevo,
  declararlo en `@theme`.
- Combinar clases condicionales con `cn()`.
- Diseño responsive mobile-first; breakpoints usados: `sm`, `md`, `lg`, `xl`.
- Mantener foco visible (`focus-visible:ring-*`) y contraste AA.

### Accesibilidad

- Usar elementos semánticos (`header`, `nav`, `main`, `table`, `button`).
- Todo input necesita `<Label htmlFor>` o `aria-label`.
- Botones solo-icono requieren `aria-label`.
- Estados dinámicos con `role="status"` / `role="alert"` cuando aplique.
- No comunicar estado solo con color; acompañar con texto (Badge).

## 6. Roles y sesión simulada

- `RoleProvider` guarda el rol en `localStorage` bajo `medigest.rol`.
- Valores: `paciente` | `farmaceutico`.
- La navbar permite alternar vistas y navega a `/paciente` o `/admin`.
- `app/admin/layout.tsx` muestra una pantalla de acceso restringido si el rol
  activo no es `farmaceutico`.
- `app/paciente/layout.tsx` hace lo mismo para la vista de paciente: si el rol
  activo no es `paciente`, ofrece activar esa vista. Ambos guards son
  simulaciones de UI.
- Usuarios demo en `lib/constants.ts` (`USUARIO_ACTUAL`).
- Al integrar autenticación real:
  1. Reemplazar `RoleProvider` por la sesión del backend.
  2. Guardar el token con `setAuthToken()` de `services/api.ts` (o migrar a cookie
     `httpOnly` gestionada por el servidor).
  3. Proteger rutas en el servidor (`proxy.ts` en Next 16, no `middleware.ts`).
  4. Eliminar de la UI cualquier selector de rol.

## 7. Variables de entorno

| Variable                | Obligatoria | Ejemplo                      | Descripción                                       |
| ----------------------- | ----------- | ---------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | Sí (real)   | `http://localhost:8000/api/v1` | URL base de la API, sin barra final.             |
| `NEXT_PUBLIC_USE_MOCKS` | No          | `true`                       | `true` usa datos locales; `false` usa la API.    |

- `.env.local` no se versiona; `.env.example` sí.
- Las variables `NEXT_PUBLIC_*` se incluyen en el bundle del navegador: **nunca**
  poner secretos ahí.
- Next.js inserta estas variables en build time; reiniciar el servidor tras
  cambiarlas.

## 8. Capa de datos

`services/index.ts` es el único punto de entrada:

```ts
import { api } from "@/services";

const { items, meta } = await api.medicamentos.listar({ page: 1, limit: 20 });
```

- Con `NEXT_PUBLIC_USE_MOCKS=true` se usa `mockClient` (latencia simulada de
  320 ms, datos en memoria que se reinician al recargar).
- Con `NEXT_PUBLIC_USE_MOCKS=false` se usa `apiClient` contra `NEXT_PUBLIC_API_URL`.
- Ambos implementan la interfaz `ApiClient` definida en `services/api.ts`.
- `ApiError` incluye `status`, `code`, `message` y `details`.

### Funciones disponibles

```ts
api.auth.login({ email, password })        // POST /auth/login
api.auth.me()                              // GET  /auth/me
api.auth.logout()                          // POST /auth/logout

api.medicamentos.listar(query)             // GET  /medicamentos
api.medicamentos.obtener(id)               // GET  /medicamentos/:id
api.medicamentos.crear(payload)            // POST /medicamentos
api.medicamentos.verificarStock(id, cant.) // GET  /medicamentos/:id/stock
api.medicamentos.actualizarStock(id, stock)// PATCH /medicamentos/:id/stock

api.recetas.crear(payload)                 // POST /recetas
api.recetas.listarPorUsuario(userId, q)    // GET  /recetas?usuarioId=...
api.recetas.listar(query)                  // GET  /recetas
api.recetas.obtener(id)                    // GET  /recetas/:id
api.recetas.actualizarEstado(id, estado)   // PATCH /recetas/:id/dispensar | /estado

api.pacientes.listar(query)                // GET  /pacientes
```

## 9. Contrato de la API REST

### 9.1 Convenciones generales

- Base: `NEXT_PUBLIC_API_URL` (por ejemplo `https://api.medigest.mx/v1`).
- Formato: JSON UTF-8; `Content-Type: application/json` en escrituras.
- Autenticación: `Authorization: Bearer <token>` en endpoints protegidos.
- Timeout del cliente: 15 s. `cache: "no-store"` en el cliente actual.
- Fechas: `YYYY-MM-DD`; timestamps: ISO 8601 UTC.
- Dinero: número decimal en MXN (sin símbolo ni separadores).
- IDs: strings opacos.

### 9.2 Envelope de éxito

Recurso individual:

```json
{
  "data": { "id": "med_001", "nombre": "Paracetamol" }
}
```

Lista paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

`meta` es obligatorio en listas. El cliente tolera un array plano, pero el
backend debe devolver el envelope.

### 9.3 Envelope de error

```json
{
  "success": false,
  "error": {
    "code": "STOCK_INSUFICIENTE",
    "message": "No hay existencias suficientes de Amoxicilina.",
    "details": { "disponibles": 8, "solicitados": 10 }
  }
}
```

Códigos esperados:

| HTTP | `code`                  | Cuándo                                          |
| ---- | ----------------------- | ----------------------------------------------- |
| 400  | `VALIDATION_ERROR`      | Body/query inválido.                            |
| 401  | `INVALID_CREDENTIALS`   | Login incorrecto.                               |
| 401  | `NO_AUTH` / `INVALID_TOKEN` | Falta token o expiró.                      |
| 403  | `FORBIDDEN`             | El rol no permite la operación.                 |
| 404  | `*_NOT_FOUND`           | Medicamento, receta o paciente inexistente.     |
| 409  | `STOCK_INSUFICIENTE`    | La receta supera el stock disponible.           |
| 500  | `INTERNAL_ERROR`        | Error no controlado del servidor.               |

### 9.4 Paginación y filtros

Query params comunes: `page` (desde 1, default 1), `limit` (default 20, máx.
100). Los filtros vacíos se omiten.

### 9.5 Autenticación

#### `POST /auth/login`

```json
{ "email": "lucia.fernandez@correo.com", "password": "••••••••" }
```

Respuesta `200`:

```json
{
  "data": {
    "token": "jwt...",
    "usuario": {
      "id": "usr_pac_001",
      "nombre": "Lucía Fernández",
      "email": "lucia.fernandez@correo.com",
      "rol": "paciente"
    },
    "expiresIn": 3600
  }
}
```

El cliente guarda el token en `localStorage` (`medigest.token`). Para producción
se recomienda migrar a cookie `httpOnly` + `SameSite`.

#### `GET /auth/me`

Devuelve `data: Usuario` del token. `401` si no hay sesión.

#### `POST /auth/logout`

`204 No Content`. El cliente limpia el token incluso si falla.

### 9.6 Medicamentos / inventario

#### `GET /medicamentos`

Query: `search`, `categoria`, `estado`, `page`, `limit`.
`MedicamentoQuery.soloDisponibles` se traduce en el cliente a `estado=disponible`.

Respuesta: `Paginated<Medicamento>`.

```json
{
  "data": [
    {
      "id": "med_paracetamol",
      "nombre": "Paracetamol",
      "principioActivo": "Paracetamol",
      "presentacion": "Tableta 500 mg",
      "laboratorio": "Genomma Lab",
      "categoria": "analgesico",
      "precio": 45,
      "stock": 120,
      "stockMinimo": 20,
      "requiereReceta": false,
      "lote": "PAR-26A14",
      "fechaVencimiento": "2027-09-30",
      "estado": "disponible",
      "actualizadoEn": "2026-11-14T09:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

`estado` lo calcula el backend: `agotado` si `stock = 0`; `bajo` si
`stock <= stockMinimo`; en otro caso `disponible`.

#### `GET /medicamentos/{id}`

`data: Medicamento` o `404 MEDICAMENTO_NOT_FOUND`.

#### `GET /medicamentos/{id}/stock?cantidad=N`

```json
{
  "data": {
    "medicamentoId": "med_amoxicilina",
    "nombre": "Amoxicilina",
    "cantidadSolicitada": 2,
    "stockActual": 8,
    "disponible": true,
    "estado": "bajo",
    "mensaje": "Hay existencias suficientes: 8 unidades disponibles."
  }
}
```

`cantidad` debe ser entero > 0 (`400` en caso contrario).

#### `PATCH /medicamentos/{id}/stock`

Body: `{ "stock": 28 }` — **valor absoluto** resultante, no incremento.
Respuesta `200` con `data: Medicamento` actualizado. Solo rol `farmaceutico`.
La UI de inventario suma 20 unidades y envía el total.

#### `POST /medicamentos`

Alta de un medicamento o de un lote nuevo. Solo rol `farmaceutico`.

```json
{
  "nombre": "Amoxicilina",
  "principioActivo": "Amoxicilina trihidratada",
  "presentacion": "Cápsula 500 mg",
  "laboratorio": "Senosiain",
  "categoria": "antibiotico",
  "precio": 120,
  "stock": 40,
  "stockMinimo": 25,
  "requiereReceta": true,
  "lote": "AMX-26A01",
  "fechaVencimiento": "2027-06-30"
}
```

Respuesta `201` con `data: Medicamento`. El backend genera `id`, `estado`
(calculado con `stock` y `stockMinimo`) y `actualizadoEn`. La UI envía el
formulario del modal de inventario; rechaza fechas de caducidad pasadas antes
de la petición.

### 9.7 Recetas

#### `POST /recetas`

```json
{
  "usuarioId": "usr_pac_001",
  "medicoNombre": "Dra. Elena Ríos",
  "items": [
    {
      "medicamentoId": "med_amoxicilina",
      "cantidad": 1,
      "dosis": "1 cápsula",
      "frecuencia": "Cada 8 horas",
      "indicaciones": "1 cápsula cada 8 horas durante 7 días."
    }
  ],
  "notas": "Completar el esquema antibiótico."
}
```

Respuesta `201`:

```json
{
  "data": {
    "id": "rec_001",
    "codigo": "RX-2026-0412",
    "usuarioId": "usr_pac_001",
    "pacienteNombre": "Lucía Fernández",
    "medicoNombre": "Dra. Elena Ríos",
    "fechaEmision": "2026-11-10",
    "estado": "pendiente",
    "items": [
      {
        "id": "rit_001",
        "medicamentoId": "med_amoxicilina",
        "nombreMedicamento": "Amoxicilina",
        "presentacion": "Cápsula 500 mg",
        "cantidad": 1,
        "precioUnitario": 120,
        "dosis": "1 cápsula",
        "frecuencia": "Cada 8 horas",
        "indicaciones": "1 cápsula cada 8 horas durante 7 días.",
        "dispensada": false
      }
    ],
    "notas": "Completar el esquema antibiótico.",
    "total": 120
  }
}
```

Reglas:

- `codigo` y `total` los genera el backend; la UI no los envía.
- `estado` inicial: `pendiente`.
- Validar stock por ítem; si falta, responder `409 STOCK_INSUFICIENTE`.
- No descontar stock al crear la receta: el descuento ocurre al dispensar
  (`PATCH /recetas/{id}/dispensar`). Si el backend decide reservar stock al
  crear, documentarlo y ajustar el cliente.
- La UI compone `indicaciones` con dosis, frecuencia e indicaciones
  adicionales; el cliente bloquea el envío si el medicamento elegido no tiene
  existencias o si la cantidad supera el stock.
- `dosis` y `frecuencia` son campos opcionales que la UI envía junto con
  `indicaciones` para mostrar la receta con claridad al paciente. Si el backend
  no los devuelve, la vista de paciente los deduce de `indicaciones` y usa
  "Según indicación" como último respaldo.
- La vista de paciente simplifica `estado`: `pendiente` y `parcial` se muestran
  como **Activo**; `dispensada` como **Completado**; `cancelada` como
  **Cancelado**.

#### `GET /recetas`

Query: `usuarioId`, `estado`, `search`, `page`, `limit`.
`search` busca en folio, paciente, médico y medicamentos.

- Paciente: `GET /recetas?usuarioId={id}` (función `listarPorUsuario`).
- Farmacéutico: sin `usuarioId` para ver todas.

Respuesta: `Paginated<Receta>`.

#### `GET /recetas/{id}`

`data: Receta` o `404 RECETA_NOT_FOUND`.

#### `PATCH /recetas/{id}/dispensar`

Solo rol `farmaceutico`. Marca la receta como `dispensada`, marca sus ítems
como `dispensada: true` y descuenta del inventario la cantidad pendiente de
cada medicamento. Si algún ítem no tiene stock suficiente, responder
`409 STOCK_INSUFICIENTE` sin descontar nada. Respuesta `200` con
`data: Receta` actualizada.

#### `PATCH /recetas/{id}/estado`

Solo rol `farmaceutico`. Body:
`{ "estado": "pendiente" | "parcial" | "cancelada" }`. Cambia el estado sin
tocar el stock. Respuesta `200` con `data: Receta`.

El cliente expone una sola función, `api.recetas.actualizarEstado(id, estado)`:
si `estado` es `dispensada` llama a `/dispensar`; en cualquier otro caso usa
`/estado`. La vista `/admin/recetas` muestra un selector de estado por tarjeta
y refresca la lista después del cambio.

#### Endpoints pendientes (no usados por la UI actual)

- `PATCH /medicamentos/{id}` → edición de catálogo.
- `POST /auth/refresh` → renovación de token.

### 9.8 Pacientes (soporte para crear recetas)

#### `GET /pacientes?search=&page=&limit=`

Solo rol `farmaceutico`. Devuelve `Paginated<Usuario>` con `rol: "paciente"`.
Se usa para poblar el selector del formulario de nueva receta.

### 9.9 Enums

```ts
type Rol = "paciente" | "farmaceutico";

type CategoriaMedicamento =
  | "analgesico" | "antibiotico" | "antiinflamatorio" | "cardiovascular"
  | "respiratorio" | "digestivo" | "antialergico" | "otro";

type EstadoStock = "disponible" | "bajo" | "agotado";

type EstadoReceta = "pendiente" | "dispensada" | "parcial" | "cancelada";
```

## 10. Integración con el backend

1. Implementar los endpoints de la sección 9 respetando envelopes y códigos.
2. Configurar `NEXT_PUBLIC_API_URL` en `.env.local`.
3. Cambiar `NEXT_PUBLIC_USE_MOCKS=false` y reiniciar `npm run dev`.
4. Verificar CORS si la API está en otro origen (incluir `Authorization`).
5. Probar cada vista: catálogo, verificación de stock, inventario, alta de
   receta e historial.
6. Opcional: eliminar `services/mock-client.ts`, `services/mock-data.ts` y la
   rama de mocks de `services/index.ts` cuando ya no se necesiten.

## 11. Particularidades de Next.js 16

- **Turbopack** es el bundler por defecto en `dev` y `build`; no agregar
  `--turbopack`.
- `middleware.ts` está deprecado: usar `proxy.ts` con export `proxy` si se
  requiere lógica de borde. El runtime de `proxy` es Node.js.
- `params`, `searchParams`, `cookies()`, `headers()` y `draftMode()` son
  **asíncronos**. Usar `await props.params`, etc.
- `next lint` fue eliminado: ejecutar `npm run lint` (ESLint CLI, flat config).
- `cacheComponents: true` y `partialPrefetching: true` están activos en
  `next.config.ts`. Al agregar datos dinámicos en Server Components, envolver en
  `<Suspense>` y seguir las guías de Cache Components en
  `node_modules/next/dist/docs/`.
- La validación de *instant navigation* usa
  `experimental.instantInsights.validationLevel: "manual-warning"` porque todas
  las vistas cargan datos en el cliente con `useAsync`; sin esa opción el
  overlay de desarrollo reporta segmentos imposibles de validar. Para validar
  una ruta concreta, exportar `instant` desde un Server Component (no funciona
  en Client Components).
- `next dev` mantiene el bloque inicial de este archivo; no eliminarlo.
- Antes de usar una API de Next.js, consultar la documentación local en
  `node_modules/next/dist/docs/`.

## 12. Reglas para agentes

**Hacer**

- Leer este archivo y la documentación de Next.js 16 antes de cambios grandes.
- Mantener el contrato `ApiClient` sincronizado con `/types` y este documento.
- Agregar estados de carga, error y vacío en cada vista nueva.
- Usar `api` desde `@/services`; nunca `fetch` en componentes.
- Respetar la paleta y las primitivas existentes.
- Ejecutar `npm run lint`, `npm run typecheck` y `npm run build`.
- Actualizar este archivo si cambia la estructura o el contrato.

**No hacer**

- No introducir secretos en variables `NEXT_PUBLIC_*`.
- No usar `any` para "resolver" tipos de la API.
- No duplicar lógica de formato; usar `lib/format.ts`.
- No crear componentes cliente innecesarios.
- No romper la simulación de roles sin reemplazarla por autenticación real.
- No eliminar el bloque `<!-- BEGIN:nextjs-agent-rules -->`.

## 13. Próximos pasos sugeridos

- Autenticación real (login, refresh, cookies `httpOnly`, guard de rutas).
- Detalle de receta e historial de cambios de estado.
- CRUD completo de medicamentos y alertas de caducidad.
- Persistencia de filtros/paginación en la URL (`searchParams`).
- Tests unitarios de servicios y E2E del flujo de recetas.
- Migrar fetching a Server Components cuando la sesión viva en cookies.
