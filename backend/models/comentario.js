// ============================================================
// models/comentario.js — EL MODELO (capa de datos + reglas de negocio)
// ------------------------------------------------------------
// El comentario es el lado "N" de la relación 1 a N con tareas:
// una tarea puede tener MUCHOS comentarios (de Pablo, de Leo, de Pepito).
// Acá NO hay req/res ni URLs: solo sabe validar, listar, crear y borrar
// comentarios contra la tabla `comentarios`.
// ============================================================

const db = require('../db');

// ---------- DTO (contrato) del comentario ----------
// Un comentario solo tiene 2 campos que manda el usuario: autor y texto.
// Ambos obligatorios. Lo mismo que Leo pidió para tarea: si llega algo
// que no está en el contrato → rechazar (400).
const CONTRATO_COMENTARIO = {
    autor: { tipo: 'string', obligatorio: true },
    texto: { tipo: 'string', obligatorio: true }
};

// ¿Un campo "vino" en el body?
function campoPresente(valor) {
    return valor !== undefined && valor !== null;
}

// Valida un body contra el contrato del comentario. Arreglo de errores (vacío = ok).
function erroresContrato(datos) {
    const errores = [];

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return ['El cuerpo debe ser un objeto JSON'];
    }

    for (const campo of Object.keys(datos)) {
        if (!(campo in CONTRATO_COMENTARIO)) {
            errores.push(`Campo no permitido: "${campo}" (no está en el contrato de comentario)`);
        }
    }

    for (const [campo, regla] of Object.entries(CONTRATO_COMENTARIO)) {
        if (!campoPresente(datos[campo]) ||
            typeof datos[campo] !== regla.tipo ||
            datos[campo].trim() === '') {
            errores.push(`Campo "${campo}" es obligatorio y debe ser texto no vacío`);
        }
    }

    return errores;
}

// ---------- Consultas a la base de datos (CRUD del lado N) ----------

// READ — todos los comentarios de UNA tarea (la relación 1 a N "hacia abajo")
function listarPorTarea(tareaId) {
    return db
        .prepare('SELECT * FROM comentarios WHERE tarea_id = ? ORDER BY id')
        .all(Number(tareaId));
}

// CREATE — agregar un comentario a una tarea y devolverlo con su id
function crearComentario(tareaId, { autor, texto }) {
    const result = db
        .prepare('INSERT INTO comentarios (tarea_id, autor, texto) VALUES (?, ?, ?)')
        .run(Number(tareaId), autor.trim(), texto.trim());

    return db.prepare('SELECT * FROM comentarios WHERE id = ?').get(result.lastInsertRowid);
}

// DELETE — borrar un comentario; devuelve cuántas filas afectó (0 = no existía)
function eliminarComentario(id) {
    return db.prepare('DELETE FROM comentarios WHERE id = ?').run(Number(id)).changes;
}

module.exports = {
    CONTRATO_COMENTARIO,
    erroresContrato,
    listarPorTarea,
    crearComentario,
    eliminarComentario
};