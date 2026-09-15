// ============================================================
// routes/tareas.js — LAS RUTAS (el "mapa" de entrada)
// ------------------------------------------------------------
// En MVC, este archivo SOLO dice "está URL + este verbo →
// tal función del controller". NO tiene lógica: ni valida,
// ni consulta, ni decide códigos. Todo eso vive en el
// controller y en el model.
// ============================================================

const express = require('express');
const controller = require('../controllers/tareasController');

const router = express.Router();

// ---------- Comentarios (relación 1 a N) ----------
// IMPORTANTE: van ANTES de las rutas con "/:id" (Express matchea en orden:
// "/comentarios" tiene que caer en esta ruta, no en la del :id).

// READ — GET /api/tareas/:id/comentarios
router.get('/:id/comentarios', controller.listarComentarios);

// CREATE — POST /api/tareas/:id/comentarios
router.post('/:id/comentarios', controller.crearComentario);

// DELETE — DELETE /api/tareas/comentarios/:id (el comentario vuela solo, sin tocar la tarea)
router.delete('/comentarios/:id', controller.eliminarComentario);

// ---------- CRUD de tareas ----------

// CREATE — POST /api/tareas
router.post('/', controller.crear);

// READ — GET /api/tareas (con filtros en la URL: ?nombre=...&estatus=...)
router.get('/', controller.listar);

// READ — GET /api/tareas/:id
router.get('/:id', controller.obtener);

// UPDATE — PATCH /api/tareas/:id
// PATCH = el verbo correcto para una actualización PARCIAL (solo los campos que llegan).
// Leo (clase 10): «el verbo correcto sería patch» (PUT manda el registro completo).
router.patch('/:id', controller.actualizar);

// Alias PUT: el verbo viejo sigue funcionando igual (compatibilidad)
router.put('/:id', controller.actualizar);

// DELETE — DELETE /api/tareas/:id
router.delete('/:id', controller.eliminar);

module.exports = router;