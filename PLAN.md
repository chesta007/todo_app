# Plan — App ToDo en 3 capas

**Entrega:** Martes 1/9/2026 (revisión con Leo)
**Fuente de los pedidos:** Clase 9 (Capacitación Alcance (9).txt)
**Ubicación:** `_tarea_todo/` (frontend y backend separados)
**BD:** SQLite local · **Node:** v24.12.0 instalado

---

## Lo que pidió Leo (resumen de la clase 9)

1. App de **ToDo** con las **3 capas separadas**: frontend, backend, base de datos.
2. **Frontend:** HTML/CSS/JS vanilla, proyecto separado, una sola pantalla, sin login.
3. **Backend:** API REST en Express, un solo modelo (tarea), responde JSON.
4. **BD:** SQLite local.
5. **CRUD de tareas:** insertar, consultar, modificar, eliminar.
6. **Campos de la tarea:** nombre, responsable, estatus, descripción (creatividad permitida).
7. **Usar el modelo con un prompt acotado y estructurado** (él evalúa cómo preguntamos).
8. **Validar que funcione** — probarlo de verdad, no copiar y pegar.
9. **Entender dónde están las cosas** — explicar qué hace cada archivo/carpeta el martes.

## Qué NO hacer (criticado en la clase 9)

- No mezclar capas en un solo proyecto.
- No tener un archivo de entrada gigante (la app anterior tenía server.js de 380 líneas).
- No usar frameworks en el front (ni React, ni Next).

---

## Estructura de carpetas objetivo

```
_tarea_todo/
├── backend/
│   ├── package.json          ← corazón del proyecto: dependencias + scripts
│   ├── server.js             ← archivo de entrada (chico)
│   ├── db.js                 ← SQLite: conexión + creación de tabla
│   └── routes/
│       └── tareas.js         ← rutas CRUD de tareas
└── frontend/
    ├── index.html            ← formulario + lista (una pantalla)
    ├── styles.css
    └── app.js                ← fetch() hacia la API del backend
```

---

## Fases de trabajo

### Fase 0 — El prompt (Pablo redacta, agente valida)
Checklist del prompt:
- [ ] App de ToDo (gestión de tareas)
- [ ] 3 capas: front vanilla separado · backend Express API REST · BD SQLite local
- [ ] CRUD de tareas (insertar, consultar, modificar, eliminar)
- [ ] Modelo: nombre, responsable, estatus, descripción
- [ ] Una sola pantalla, sin login
- [ ] Pedido acotado (solo esto, nada más)

### Fase 1 — Estructura
- Crear carpetas `backend/` y `frontend/` en `_tarea_todo/`.

### Fase 2 — Backend
- `npm init` + `express` + `cors`.
- SQLite con `node:sqlite` (módulo integrado de Node 24 — evita compilación nativa en Windows).
- Tabla `tareas`: id (autoincremental), nombre, responsable, estatus, descripcion.
- Endpoints:

| Método | Ruta               | Operación |
|--------|--------------------|-----------|
| POST   | `/api/tareas`      | Crear     |
| GET    | `/api/tareas`      | Listar    |
| GET    | `/api/tareas/:id`  | Consultar |
| PUT    | `/api/tareas/:id`  | Modificar |
| DELETE | `/api/tareas/:id`  | Eliminar  |

### Fase 3 — Frontend
- `index.html`: formulario (4 campos) + lista de tareas con botones editar/eliminar.
- `app.js`: `fetch()` a `http://localhost:3000/api/tareas`.

### Fase 4 — Validación (obligatorio)
- [ ] Levantar backend con `npm start`.
- [ ] Probar los 5 endpoints con curl (crear, listar, consultar, modificar, borrar).
- [ ] Probar el front en el navegador (flujo completo).
- [ ] Registrar lo probado para mostrarlo el martes.

### Fase 5 — Comprensión para el martes
- [ ] Generar `ESTRUCTURA.md`: qué hace cada archivo, en una línea.
- [ ] Pablo lo reescribe en sus palabras (es lo que Leo va a preguntar).
- [ ] Actualizar `TAREAS.md`.

---

## Conceptos clave de la clase 9 (para repasar antes del martes)

| Concepto | Idea |
|---|---|
| 3 capas | Front (ve el usuario) / Back (lógica) / BD (persistencia) |
| API | Puente entre sistemas que no hablan el mismo idioma |
| API REST | El tipo de API más usado |
| JSON | Formato de datos front↔back (objetos `{}`, arreglos `[]`) |
| request / response | Lo que recibe / lo que responde el backend |
| CRUD | Create, Read, Update, Delete |
| package.json | Corazón del proyecto: dependencias y scripts |

## Riesgos y decisiones

- **Windows + paquetes nativos** → se evita usando `node:sqlite` (integrado en Node 24).
- **CORS** → el front (abierto directo en navegador) necesita que el back permita su origen.
- **Sin login** → confirmado con Leo ("es una sola pantalla, esperamos seguir creciendo").