# Checklist — Pedidos de Leo (Clase 9) vs. App construida

> Fecha de verificación: 27/8/2026 · Resultado: **16/17 cumplidos** · 1 pendiente (explicarlo en tus palabras)

## ✅ 1. App de ToDo, minimizada (no la del hotel)
**Leo:** "Vas a explicarle que quieres hacer una aplicación de ToDo, no de hotel, vamos a minimizarla."
**Cumplido:** App genérica de gestión de tareas, sin nada del proyecto del hotel.
**Evidencia:** `_tarea_todo/` — única funcionalidad: CRUD de tareas.

## ✅ 2. Las 3 capas separadas
**Leo:** "Tiene que tener las tres capas."
**Cumplido:** 3 capas en 2 proyectos + BD.
**Evidencia:**
- Capa 1 (Front): `frontend/` — lo que ve el usuario
- Capa 2 (Back): `backend/` — lógica de negocio
- Capa 3 (BD): `backend/db.js` + `tareas.db` (SQLite)

## ✅ 3. Frontend en HTML/CSS/JS vanilla, en proyecto separado
**Leo:** "El front debe estar en JavaScript vanilla, separado en un proyecto."
**Cumplido:** Sin frameworks (sin React/Next). Proyecto aparte.
**Evidencia:** `frontend/index.html` + `frontend/styles.css` + `frontend/app.js` — solo JS puro y `fetch()`.

## ✅ 4. Una sola pantalla, sin login
**Leo:** "¿Podemos obviar el login?" → "Es una sola pantalla, esperamos seguir creciendo."
**Cumplido:** Un solo HTML, sin autenticación.
**Evidencia:** `frontend/index.html` es la única pantalla; no hay login en ningún lado.

## ✅ 5. Backend como API REST en Express, en proyecto separado
**Leo:** "Un backend hecho en Express" + "una API REST."
**Cumplido:** Proyecto `backend/` independiente con Express.
**Evidencia:** `backend/package.json` (dependencia `express`), `backend/server.js`.

## ✅ 6. Un solo modelo: tarea / todo
**Leo:** "Va a manejar un solo modelo: el modelo tarea o el modelo todo."
**Cumplido:** Solo existe la tabla `tareas`. Nada más.
**Evidencia:** `backend/db.js` — `CREATE TABLE tareas (...)`.

## ✅ 7. CRUD de tareas (insertar, consultar, modificar, eliminar)
**Leo:** "Un CRUD de tareas donde las operaciones para poder insertar, consultar, modificar y eliminar."
**Cumplido:** Los 5 endpoints del CRUD.
**Evidencia:** `backend/routes/tareas.js`:

| Operación | Ruta | Método |
|---|---|---|
| Create (insertar) | `/api/tareas` | POST |
| Read (consultar todas) | `/api/tareas` | GET |
| Read (consultar una) | `/api/tareas/:id` | GET |
| Update (modificar) | `/api/tareas/:id` | PUT |
| Delete (eliminar) | `/api/tareas/:id` | DELETE |

## ✅ 8. Campos del modelo: nombre, responsable, estatus, descripción
**Leo:** "Tienes el nombre de la tarea, responsable de la tarea, el estatus de la tarea, y debes tener una descripción" (creatividad permitida).
**Cumplido:** Exactamente esos 4 campos + id.
**Evidencia:** `backend/db.js` (tabla) y `frontend/index.html` (formulario con los 4 inputs).

## ✅ 9. Base de datos SQLite local
**Leo:** "La base de datos tú eliges: SQLite local o Supabase." (Elegimos SQLite local.)
**Cumplido:** SQLite en archivo local.
**Evidencia:** `backend/db.js` usa `node:sqlite` → genera `backend/tareas.db`.

## ✅ 10. Front y Back se comunican con JSON (request/response)
**Leo:** "El back trabaja recibiendo JSON y enviando JSON. Se llama request lo que se recibe y response lo que se responde."
**Cumplido:** Todo entra/sale como JSON.
**Evidencia:** `frontend/app.js` manda `fetch()` con `Content-Type: application/json`; el backend usa `express.json()` y responde `res.json(...)`.

## ✅ 11. Validar que lo que da el modelo funcione
**Leo:** "Tienes que validar que lo que te dio funcione."
**Cumplido:** CRUD probado de verdad con curl (cliente de API).
**Evidencia (resultados reales de la prueba):**
- POST → `{"id":1,"nombre":"Preparar presentacion",...}` (201)
- GET todas → `[{...},{...}]`
- GET /1 → tarea completa
- PUT /1 → estatus cambió a `completada`
- DELETE /2 → HTTP 204

## ✅ 12. No mezclar las capas (como la app anterior)
**Leo:** Criticó la app anterior: todo junto en un proyecto Express, server.js de 380 líneas.
**Cumplido:** Front y back separados; dentro del back, cada responsabilidad en su archivo.
**Evidencia:** `backend/server.js` (entrada chica, ~20 líneas) + `routes/tareas.js` (rutas) + `db.js` (BD).

## ✅ 13. Saber dónde están las cosas (entender la estructura)
**Leo:** "Si yo te pregunto algo de ese código, ¿entenderías dónde están las cosas?"
**Cumplido (a medias):** Existe `ESTRUCTURA.md` con el mapa archivo por archivo. Falta tu parte.
**Evidencia:** `_tarea_todo/ESTRUCTURA.md`.

## ✅ 14. package.json como corazón del proyecto
**Leo:** "package.json es el corazón de tu proyecto: te dice qué usa y cómo corre la aplicación."
**Cumplido:** `backend/package.json` con dependencias (express, cors) y script `npm start`.
**Evidencia:** `backend/package.json` → `"start": "node server.js"`.

## ✅ 15. Probar el back sin front (cliente de API)
**Leo:** Mostró cómo probar el backend solo con un cliente de API (Postman) para saber dónde falla.
**Cumplido:** Probamos los endpoints con curl sin abrir el frontend.
**Evidencia:** Comandos curl del checklist anterior (punto 11).

## ✅ 16. Desacople (el back no sabe quién le habla)
**Leo:** "El back no sabe si fue un front web, mobile u otro back. Eso se llama desacoplar."
**Cumplido:** El backend solo recibe/responder JSON por HTTP; no conoce el frontend.
**Evidencia:** `backend/routes/tareas.js` no referencia ningún archivo del frontend; CORS lo deja abierto a cualquier origen.

## ⏳ 17. Explicar la estructura en tus palabras (tu parte para el martes)
**Leo:** "La idea es que tú llegues a entender lo que te da: esto es esto, esto aquello, para esto sirve cada cosa."
**Pendiente:** Reescribir `ESTRUCTURA.md` en tus propias palabras (sin mirarlo). Si podés explicar cada archivo con una frase tuya, el punto está cumplido.

---

## Resumen para llevar el martes

| Bloque | Estado |
|---|---|
| Arquitectura (3 capas separadas) | ✅ |
| Backend (Express + CRUD + JSON) | ✅ |
| Base de datos (SQLite local) | ✅ |
| Frontend (vanilla, 1 pantalla, sin login) | ✅ |
| Validación real (curl) | ✅ |
| Comprensión personal de la estructura | ⏳ Hacé el ejercicio de reescribirlo en tus palabras |