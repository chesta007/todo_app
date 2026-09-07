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

// CREATE — POST /api/tareas
router.post('/', controller.crear);

// READ — GET /api/tareas (con filtros en la URL: ?nombre=...&estatus=...)
router.get('/', controller.listar);

// READ — GET /api/tareas/:id
router.get('/:id', controller.obtener);

// UPDATE — PUT /api/tareas/:id
router.put('/:id', controller.actualizar);

// DELETE — DELETE /api/tareas/:id
router.delete('/:id', controller.eliminar);

module.exports = router;