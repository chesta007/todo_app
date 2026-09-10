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

// ---------- CREATE — POST /api/tareas ----------
function crear(req, res) {
    // 1. Saca del request lo que mandó el front (los 4 campos del modelo)
    const datos = req.body;

    // 2. Defensivo: ¿vino un body (un objeto JSON)?
    //    Sin Content-Type JSON, Express no lo parsea y req.body queda undefined.
    //    "undefined.nombre" rompería con un error 500 → respondemos 400 (culpa del cliente).
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return res.status(400).json({ error: 'Cuerpo requerido: se espera un objeto JSON' });
    }

    // 3. Tipos: nombre y responsable deben ser TEXTO.
    //    Un número ({"nombre": 123}) haría reventar el .trim() del modelo → 500.
    if (typeof datos.nombre !== 'string' || typeof datos.responsable !== 'string') {
        return res.status(400).json({ error: 'nombre y responsable deben ser texto' });
    }

    // 4. Valida con las reglas del MODELO (defensivo, Leo clase 1)
    //    Si no pasa la validación → 400 (culpa del cliente: datos incompletos)
    if (!tareaModel.tieneCamposObligatorios(datos)) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: nombre y responsable' });
    }

    // 5. Valida el estatus contra la lista cerrada (si viene)
    if (datos.estatus && !tareaModel.estatusValido(datos.estatus)) {
        return res.status(400).json({
            error: `Estatus inválido: debe ser ${tareaModel.ESTADOS_VALIDOS.join(', ')}`
        });
    }

    // 6. Delega en el MODELO (que inserta y devuelve la tarea con su id)
    const nuevaTarea = tareaModel.crearTarea(datos);

    // 7. Responde 201 (Created) con la tarea en JSON
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

// ---------- UPDATE — modificar una (PUT /api/tareas/:id) ----------
function actualizar(req, res) {
    const datos = req.body;

    // Defensivo: si no vino un body JSON, no hay nada que actualizar → 400
    // (sin esto, undefined "se rompería" dentro del modelo → 500)
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return res.status(400).json({ error: 'Cuerpo requerido: se espera un objeto JSON' });
    }

    // Delega en el MODELO: conserva lo no enviado, valida antes de escribir
    const resultado = tareaModel.actualizarTarea(req.params.id, datos);

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

module.exports = {
    crear,
    listar,
    obtener,
    actualizar,
    eliminar
};