// ============================================================
// controllers/tareasController.js — EL CONTROLLER (el "mozo")
// ------------------------------------------------------------
// En MVC, el Controller es el que recibe la orden (req) y la
// convierte en una respuesta (res). NO guarda ni consulta:
// para eso le habla al Model. Tampoco define URLs: eso lo
// hacen las rutas.
//
// Regla: acá se decide el CÓDIGO HTTP (200/201/400/404/500).
// ============================================================

const tareaModel = require('../models/tarea');
const comentarioModel = require('../models/comentario');

// ---------- CREATE — POST /api/tareas ----------
function crear(req, res) {
    // Valida contra el CONTRATO (DTO, Leo clase 13): el body debe ser un
    // objeto JSON con SOLO los campos permitidos, del tipo correcto, y con
    // los obligatorios (nombre, responsable) presentes y no vacíos.
    // Si llega algo distinto al contrato → 400 (culpa del cliente).
    const errores = tareaModel.erroresContrato(req.body, { crear: true });
    if (errores.length > 0) {
        return res.status(400).json({ error: errores.join(' · ') });
    }

    // Delega en el MODELO (que inserta y devuelve la tarea con su id)
    const nuevaTarea = tareaModel.crearTarea(req.body);

    // Responde 201 (Created) con la tarea en JSON
    res.status(201).json(nuevaTarea);
}

// ---------- READ — listar (GET /api/tareas) ----------
function listar(req, res) {
    const filtros = req.query; // los filtros llegan en la URL (?nombre=...&estatus=...)

    // Defensivo: si el estatus viene pero no es uno de los cerrados → 400
    if (filtros.estatus && !tareaModel.estatusValido(filtros.estatus)) {
        return res.status(400).json({
            error: `Estatus inválido: debe ser ${tareaModel.ESTADOS_VALIDOS.join(', ')}`
        });
    }

    // Delega en el MODELO (arma el WHERE dinámico y consulta)
    const tareas = tareaModel.listarTareas(filtros);
    res.json(tareas); // responde un ARREGLO de objetos JSON
}

// ---------- READ — consultar una (GET /api/tareas/:id) ----------
function obtener(req, res) {
    const tarea = tareaModel.obtenerTareaPorId(req.params.id);

    // ¿No existe? → 404 (Not Found)
    if (!tarea) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(tarea); // existe → 200 con la tarea
}

// ---------- UPDATE — modificar una (PATCH /api/tareas/:id; PUT queda de alias) ----------
// Actualización PARCIAL (Leo, clase 13): solo escribe los campos que vienen.
function actualizar(req, res) {
    // Delega en el MODELO: valida contra el contrato, arma el SET dinámico
    // y conserva lo que no se mandó.
    const resultado = tareaModel.actualizarTarea(req.params.id, req.body);

    // El model puede devolver: { tarea } | { error: 'not_found' } | { error: 'datos invalidos' }
    if (resultado.error === 'not_found') {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    if (resultado.error) {
        return res.status(400).json({ error: resultado.detalle });
    }

    res.json(resultado.tarea); // 200 con la tarea actualizada
}

// ---------- DELETE — eliminar una (DELETE /api/tareas/:id) ----------
function eliminar(req, res) {
    // El MODELO borra y avisa cuántas filas afectó (0 = no existía)
    const cambios = tareaModel.eliminarTarea(req.params.id);

    if (cambios === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    // 204 (No Content) = "borrado, no tengo nada más que decirte"
    res.status(204).end();
}

// ---------- COMPLEMENTO de la relación 1 a N: comentarios ----------
// (Leo, clase 13: una tarea puede tener varios comentarios)

// READ — GET /api/tareas/:id/comentarios → los comentarios de esa tarea
function listarComentarios(req, res) {
    // La tarea padre debe existir (si no, no puede tener comentarios) → 404
    if (!tareaModel.obtenerTareaPorId(req.params.id)) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    const comentarios = comentarioModel.listarPorTarea(req.params.id);
    res.json(comentarios); // arreglo (vacío si todavía no tiene)
}

// CREATE — POST /api/tareas/:id/comentarios → agregar un comentario
function crearComentario(req, res) {
    if (!tareaModel.obtenerTareaPorId(req.params.id)) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Valida contra el contrato del comentario: { autor } y { texto }, texto no vacío
    const errores = comentarioModel.erroresContrato(req.body);
    if (errores.length > 0) {
        return res.status(400).json({ error: errores.join(' · ') });
    }

    const comentario = comentarioModel.crearComentario(req.params.id, req.body);
    res.status(201).json(comentario); // 201 (Created)
}

// DELETE — DELETE /api/comentarios/:id → borrar un comentario
function eliminarComentario(req, res) {
    const cambios = comentarioModel.eliminarComentario(req.params.id);

    if (cambios === 0) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    res.status(204).end();
}

module.exports = {
    crear,
    listar,
    obtener,
    actualizar,
    eliminar,
    listarComentarios,
    crearComentario,
    eliminarComentario
};