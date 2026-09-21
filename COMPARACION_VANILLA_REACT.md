# Comparación: app ToDo en vanilla JS vs React

**Clase 15 — martes 22/9.** Lo que pidió Leo: *"que compares lo que tenés en un branch con otro, para que te des cuenta que cambia el código"*.

## Los dos branches

| Branch | Qué contiene | Cómo se ve |
|---|---|---|
| `feature/clase13-dto-comentarios` (commit `4c606a9`) | La app aprobada: **`backend/`** (Express) + **`frontend/`** (HTML/CSS/JS vanilla) | Abrir `frontend/index.html` con un servidor estático (o `file://`) |
| `feature/react` (commit `5388bdc`) | El **mismo backend** + **`frontend-react/`** (Vite + React 19 + TypeScript + React Router 7) | `npm run dev` en `frontend-react/` → http://localhost:5173 |

**Regla de oro de esta conversión:** el backend NO se tocó. La API, la base de datos y los estilos son los mismos. Solo cambió la capa de la vista.

## Cómo correr cada versión

### Vanilla (branch `feature/clase13-dto-comentarios`)
```
cd backend && npm start        # API en http://localhost:3000
# frontend: abrir frontend/index.html (servidor estático o doble clic)
```

### React (branch `feature/react`)
```
cd backend && npm start        # API en http://localhost:3000 (igual)
cd frontend-react && npm run dev   # app en http://localhost:5173
# el proxy de Vite manda /api → localhost:3000 (no hay CORS ni URLs absolutas)
```

## El antes y el después, archivo por archivo

| Vanilla (`frontend/`) | React (`frontend-react/src/`) | Qué pasó |
|---|---|---|
| `index.html` + `tarea.html` (2 páginas, `?id=` en la URL) | `main.tsx` + `App.tsx` (1 sola página, 3 rutas: `/`, `/tareas/:id`, `*`) | Las "páginas" ya no son archivos: son **rutas** (SPA — lo que Leo mostró con el `createRoot` y el `<div id="root">` vacío) |
| `js/model.js` (117 líneas) | `api.ts` | Casi NO cambió: mismas funciones, mismos verbos, mismo manejo de errores. Solo cambió la URL (`/api/tareas` relativa por el proxy) y ahora devuelve **tipos** |
| `js/view.js` (158 líneas) | `componentes/TarjetaTarea.tsx`, `ChipEstatus.tsx`, `TarjetaComentario.tsx`, `Iconos.tsx` | `pintarLista`/`pintarDetalle`/`pintarComentarios` (que armaban HTML con template literals + `innerHTML`) ahora son **componentes**: funciones que retornan JSX (HTML escrito adentro del JS) |
| `js/controller.js` (192 líneas) | `paginas/PaginaLista.tsx` | El director de eventos (`addEventListener` por todos lados, `editandoId`, `document.getElementById`) ahora es **estado + hooks** (`useState`/`useEffect`) y el HTML de la página vive en el mismo componente |
| `js/detalle.js` (137 líneas) | `paginas/PaginaDetalle.tsx` | Igual: `URLSearchParams.get('id')` → `useParams()`; `ocultarSecciones()` → **render condicional** |
| — | `tipos.ts` | Lo NUEVO: TypeScript define la forma de Tarea/Comentario (el mismo contrato del backend, del lado del front) |
| — | `paginas/PaginaNoEncontrada.tsx` | Lo NUEVO: la ruta `*` — en vanilla no había página 404 en el front |

## Lo que DESAPARECIÓ (el punto de Leo: "cómo cambia todo tu código")

| Herramienta vanilla | Reemplazo en React | Por qué |
|---|---|---|
| `document.getElementById(...)` / `querySelector` | `useState` + `value={...}` | No se agarran cajitas del HTML: cada input es **controlado** por estado |
| `innerHTML = '...'` | JSX (`{tarea.nombre}`) | El HTML se escribe en el componente, no como string |
| `escapeHtml()` (26 líneas manuales) | **Nada — React escapa solo** | Cualquier `{texto}` se muestra como texto, jamás como código → la protección XSS que arreglamos en la auditoría viene **gratis** |
| `addEventListener('submit'/'click'/'change')` + delegación de eventos (`closest('button[data-accion]')`) | `onSubmit`, `onClick`, `onChange` en el propio componente | El evento se declara donde está el botón |
| `classList.toggle('hidden')` | Render condicional (`{tarea && ...}`) | Si no hay tarea, la sección simplemente no se dibuja |
| `form.reset()` + `volcarEnFormulario()` | Estado inicial + `key` | Cuando cambia la `key`, React **recrea** el componente (nada de resetear DOM) |
| `btn.disabled = true` (anti doble-click) | `enviando` (estado) | El botón se deshabilita mientras el estado diga que está enviando |
| El bug del cartel "No hay tareas" (que `innerHTML=''` lo borraba) | **No puede existir** | No hay `innerHTML` — el aviso es un render condicional |
| `tarea.html?id=13` (recarga el navegador) | `<Link to="/tareas/13">` | Navega SIN recargar (SPA) |
| `URLSearchParams(window.location.search)` | `useParams()` | La ruta ya trae el `:id` |

## Lo que QUEDÓ IGUAL

- **`backend/` completo** — ni una línea tocada (API, DB, validaciones, DTO, PATCH, comentarios).
- **`styles.css`** — copiado tal cual (440 líneas); solo se cambió `class` → `className`.
- **El model (`api.ts`)** — las mismas 8 funciones de `model.js` con la misma lógica.
- **El comportamiento:** filtros con default "Pendiente", PATCH por chip, autor recordado en `localStorage` (misma key `comentario-autor`), 404 oculta secciones, mensajes de error del backend en pantalla.
- **La base de datos** (`tareas.db`) — ni una migración.

## Verificación (todo probado el 20/9)

- `npm run build` → TypeScript + Vite, **0 errores**.
- `npm run lint` → **0 warnings, 0 errores**.
- E2E contra la API (8/8 OK): crear → PATCH estatus → GET detalle → 2 comentarios → borrar 1 → filtro por nombre → DELETE → verificación de limpieza.
- Render verificado con Chrome headless: lista con datos reales (proxy OK), detalle con 4 comentarios, tarea inexistente → "Tarea no encontrada" + secciones ocultas, ruta rara → "Ruta no encontrada".

## Stack instalado (el mismo de Iris, según el bundle de producción)

```
React 19.3 + React Router 7.18 + TypeScript 6 + Vite 8 (npm create vite@latest)
react-router-dom + proxy /api → localhost:3000 en vite.config.ts
```