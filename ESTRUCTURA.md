# Estructura del proyecto — ToDo App (3 capas)

**Entrega:** Martes 1/9/2026 · **Ubicación:** `_tarea_todo/`

## Mapa de carpetas

```
_tarea_todo/
├── PLAN.md                  ← El plan completo (pedidos de Leo + diseño)
├── backend/                 ← CAPA 2: lógica de negocio (API REST)
│   ├── package.json         ← "Corazón" del backend: dependencias (express, cors) y script npm start
│   ├── server.js            ← Archivo de ENTRADA: arma la app Express, middlewares, rutas, puerto 3000
│   ├── db.js                ← CAPA 3 (conexión): crea/abre la BD SQLite (tareas.db) y la tabla tareas
│   ├── routes/
│   │   └── tareas.js        ← Las 5 rutas CRUD (POST/GET/GET:id/PUT/DELETE)
│   └── tareas.db            ← La base de datos SQLite (se genera sola al levantar)
└── frontend/                ← CAPA 1: lo que ve el usuario (HTML/CSS/JS vanilla)
    ├── index.html           ← La pantalla: formulario + lista de tareas
    ├── css/
    │   └── styles.css       ← Diseño "Pizarra": crema, serif Marcellus, estatus en chips
    └── js/
        └── app.js           ← La lógica del front: fetch() a la API, pinta tareas, contadores
```

## Qué hace cada archivo (para explicar el martes)

| Archivo | Capa | Qué hace |
|---|---|---|
| `frontend/index.html` | 1 (Front) | La única pantalla: formulario (nombre, responsable, estatus, descripción) + lista de tareas |
| `frontend/css/styles.css` | 1 (Front) | Diseño "Pizarra": paleta crema/verde bosque, serif Marcellus, animaciones |
| `frontend/js/app.js` | 1 (Front) | Habla con el backend con `fetch()`, pinta las tareas, maneja agregar/editar/eliminar/cambiar estatus |
| `backend/server.js` | 2 (Back) | Levanta Express, habilita CORS y JSON, conecta las rutas, escucha en el puerto 3000 |
| `backend/routes/tareas.js` | 2 (Back) | Las 5 operaciones CRUD sobre tareas (la lógica de negocio) |
| `backend/db.js` | 3 (BD) | Abre `tareas.db` (SQLite) y crea la tabla `tareas` si no existe |
| `backend/package.json` | — | Declara dependencias y el comando `npm start` |

## Cómo se comunican las capas

```
[Frontend: index.html]  --fetch(JSON)-->  [Backend: server.js → routes/tareas.js]  --SQL-->  [BD: tareas.db]
        ↑                                          |                                              |
        └------------ response (JSON) <------------┘
```

1. El frontend manda un **request** (JSON) al backend.
2. El backend **procesa** (crea/lee/modifica/borra en la base de datos).
3. El backend responde un **response** (JSON).
4. El frontend pinta lo que recibió.

## Tabla de la base de datos

```sql
CREATE TABLE tareas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT NOT NULL,
    responsable TEXT NOT NULL,
    estatus     TEXT NOT NULL DEFAULT 'pendiente',   -- pendiente | en_progreso | hecha
    descripcion TEXT DEFAULT ''
);
```

## Endpoints de la API

| Método | Ruta               | Operación CRUD | Respuesta |
|--------|--------------------|----------------|-----------|
| POST   | `/api/tareas`      | Create         | 201 + tarea creada |
| GET    | `/api/tareas`      | Read (todas)   | 200 + arreglo de tareas |
| GET    | `/api/tareas/:id`  | Read (una)     | 200 + tarea · 404 si no existe |
| PUT    | `/api/tareas/:id`  | Update         | 200 + tarea actualizada |
| DELETE | `/api/tareas/:id`  | Delete         | 204 (sin cuerpo) |

### Filtros en el GET (tarea del jueves, clase 10)

El GET `/api/tareas` acepta **query params** que se convierten en un `WHERE` de SQL:

```
GET /api/tareas?nombre=presupuesto&responsable=Ana&estatus=hecha
```

| Filtro | SQL que genera | Cómo busca |
|---|---|---|
| `nombre` | `nombre LIKE '%...%'` | parcial (que contenga) |
| `responsable` | `responsable LIKE '%...%'` | parcial (que contenga) |
| `estatus` | `estatus = '...'` | exacto contra valores cerrados |

- El `WHERE` se arma **solo con los filtros que llegan** (sin filtros → trae todo).
- Si `estatus` no es válido → 400 (validación defensiva).
- Ejemplos probados con curl: `?estatus=pendiente` · `?nombre=tarea` · `?nombre=ultima&responsable=Pablo` ✅

## Cómo levantar la app

1. **Backend:** abrir una terminal en `_tarea_todo/backend/` y ejecutar `npm start`.
2. **Frontend:** abrir `_tarea_todo/frontend/index.html` en el navegador (doble clic).
3. Probar el CRUD completo y cambiar el estatus desde el chip de cada tarea (Pendiente / En progreso / Hecha).
4. Probar el buscador: escribir en "Por nombre"/"Por responsable", elegir estatus y presionar **Filtrar**.
5. **Al abrir la app arranca mostrando solo las pendientes** (default del buscador) — para ver todo, elegir **"Todas"** en el desplegable de estatus. "Limpiar" vuelve a las pendientes.

## Diseño aplicado

- **Estética "Pizarra"**: clásica y sobria — fondo travertino/crema, tarjetas marfil, tipografía serif *Marcellus* para títulos y *Archivo* para el cuerpo.
- **3 estatus con color semántico**: Pendiente (beige), En progreso (celeste), Hecha (verde) — cada uno con su role único.
- **Cambio de estatus desde la tarea**: chip-selector en la tarjeta (sin recargar, PUT a la API).
- **Micro-interacciones**: fade al aparecer tareas, elevación de tarjetas al hover, botones de icono con alivio al click.
- **Contadores en vivo**: "3 en total" y "2 abiertas · 1 hechas" actualizados con cada cambio.