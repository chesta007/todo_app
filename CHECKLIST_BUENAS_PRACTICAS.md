# Checklist — Buenas prácticas de Leo vs. App ToDo (auditoría)

> Fuente: buenas prácticas extraídas de las 9 clases (Capacitación Alcance 1-9 + laboratorios).
> Estado: 49 ✅ · 3 ⏳ (proceso, del alumno). Los ⚠️ de código fueron corregidos el 27/8/2026.

## A. Convenciones de código

| # | Práctica (clase) | Estado |
|---|---|---|
| 1 | camelCase en variables y funciones (1, 2) | ✅ |
| 2 | Nombres sin espacios, símbolos ni acentos (7) | ✅ |
| 3 | Punto y coma al final (1, 7) | ✅ |
| 4 | `const` para lo que no cambia, `let` para lo que cambia (1, 5, 8) | ✅ |
| 5 | `const` para arreglos y objetos (1, 5) | ✅ |
| 6 | `===` (triple igual), no `==` (1) | ✅ |
| 7 | Strings entre comillas (1, 7) | ✅ |
| 8 | Indentación correcta (1) | ✅ |
| 9 | Comentarios explicando cada paso (1, 8) | ✅ |
| 10 | Nombres descriptivos (8) | ✅ |
| 11 | IDs con prefijo tipo + guion (`btn-agregar`, `input-nombre`) (8) | ✅ |
| 12 | IDs únicos, sin duplicar (7, 8) | ✅ |
| 13 | Carpetas en minúsculas (7) | ✅ |
| 14 | JS y CSS en carpetas propias (`js/`, `css/`) (7) | ✅ corregido (estaban sueltos) |

## B. Estructura HTML/CSS/JS y DOM

| # | Práctica (clase) | Estado |
|---|---|---|
| 15 | CSS en archivo externo con `<link>` + `rel` (5, 7) | ✅ |
| 16 | JS enlazado con `<script src>` al final del body (7) | ✅ |
| 17 | `getElementById` sin `#` (7, 8) | ✅ |
| 18 | Guardar el elemento en variable (7, 8) | ✅ |
| 19 | `.value` para leer el valor (8) | ✅ |
| 20 | `type="button"` / submit + `preventDefault()` (8) | ✅ (alternativa avanzada que Leo describió) |
| 21 | No usar `alert()`, mostrar en pantalla (8) | ✅ |
| 22 | Placeholders en inputs (5) | ✅ |
| 23 | Fuente única de verdad (no duplicar estado) (8) | ✅ la lista siempre sale del GET |
| 24 | Construir HTML y volcar al DOM (5, 8) | ✅ |
| 25 | `innerHTML` para contenido dinámico (8) | ✅ |
| 26 | Recorrer usando el elemento del índice actual (8) | ✅ `tarea.nombre` en el bucle |
| 27 | `.length` para contadores, nunca hardcodear (8) | ✅ |
| 28 | `display:flex` / grid para alinear (8) | ✅ |

## C. Arquitectura y backend (clase 9)

| # | Práctica | Estado |
|---|---|---|
| 29 | 3 capas separadas | ✅ |
| 30 | Front vanilla en proyecto separado | ✅ |
| 31 | Backend Express API REST en proyecto separado | ✅ |
| 32 | Un solo modelo (tarea) | ✅ |
| 33 | Archivo de entrada chico (server.js 18 líneas) | ✅ |
| 34 | `package.json` con dependencias y scripts | ✅ |
| 35 | Levantar con `npm start`, sin `.bat` | ✅ |
| 36 | Carpeta de módulos/rutas | ✅ |
| 37 | CRUD completo (5 endpoints) | ✅ |
| 38 | Request/response en JSON | ✅ |
| 39 | Desacople: el back no sabe quién lo llama | ✅ |
| 40 | Probar back sin front (cliente API / curl) | ✅ |
| 41 | Middlewares en Express (`cors`, `json`) | ✅ |

## D. Datos y base de datos

| # | Práctica (clase) | Estado |
|---|---|---|
| 42 | ID automático, no lo da el usuario (6) | ✅ AUTOINCREMENT |
| 43 | Tipos de datos correctos por campo (6) | ✅ |
| 44 | Valores cerrados para estados (normalización) (6) | ✅ corregido: `ESTADOS_VALIDOS` valida en POST y PUT (400 si no matchea) |
| 45 | Validación defensiva de datos de entrada (1, 2) | ✅ corregido: POST valida nombre/responsable + estatus; PUT conserva valores y valida que no queden vacíos |

## E. Validación y pruebas

| # | Práctica (clase) | Estado |
|---|---|---|
| 46 | Validar que funcione, probar de verdad (7, 9) | ✅ curl: CRUD completo + 400 de las nuevas validaciones |
| 47 | `console.log` para inspeccionar (1, 2, 5) | ✅ en server.js |
| 48 | Detectar el punto de falla para preguntar bien (1) | ✅ (bug del JSON en curl diagnosticado y resuelto) |

## F. Proceso y forma de trabajar (pendientes del alumno)

| # | Práctica (clase) | Estado |
|---|---|---|
| 49 | Entender el código, no copiar a ciegas (1, 6, 9) | ⏳ reescribir ESTRUCTURA.md en palabras propias |
| 50 | Prompts acotados y estructurados, no abiertos (9) | ⏳ redactar el prompt (aunque sea a posteriori) para mostrárselo a Leo |
| 51 | Compartir el código para revisión (zip/git/Drive) (8, 9) | ⏳ subir el proyecto antes del martes |
| 52 | No hardcodear datos del negocio (1, 5) | ✅ datos de ejemplo en BD, no en código |

## G. Filtros (tarea del jueves, clase 10)

| # | Práctica | Estado |
|---|---|---|
| 53 | El filtrado lo hace el BACKEND con SQL (WHERE), no el front | ✅ GET /api/tareas con query params |
| 54 | WHERE dinámico: solo agrega condiciones para los filtros que llegan | ✅ condiciones[] + valores[] |
| 55 | Búsqueda parcial en texto con `LIKE '%...%'` (nombre, responsable) | ✅ |
| 56 | Igualdad exacta para valores cerrados (estatus) | ✅ `estatus = ?` |
| 57 | Validación defensiva también en el filtro | ✅ estatus inválido → 400 |
| 58 | Query params armados con `URLSearchParams` (no a mano) | ✅ frontend |
| 59 | Fuente única de verdad: la lista SIEMPRE sale del GET (ahora filtrado) | ✅ repinta con la respuesta del backend |
| 60 | Sin filtros → trae todo (el WHERE queda vacío, no rompe) | ✅ probado |
| 61 | Botón "Limpiar" vuelve al estado inicial (form.reset()) | ✅ reset vuelve al default "pendiente" |
| 62 | Default de la app: mostrar solo las pendientes al abrir (no traer todas) | ✅ `selected` en el option "Pendiente" |

---

## Resumen

- **Código:** 49/52 prácticas cumplidas (los 3 ⚠️ de código corregidos el 27/8) + 10/10 del filtro nuevo (clase 10).
- **Pendientes (proceso, del alumno):** #49, #50 y #51 — los 3 con ayuda disponible.
- **Para el martes:** llevar la app andando + saber explicar cada archivo + poder contar cómo se construyó.
- **Para el jueves (nuevo):** explicar cómo funciona el filtro (query params → WHERE → LIKE) — Leo va a enseñar SQL SELECT...WHERE.