// ============================================================
// models/tarea.js — EL MODELO (capa de datos + reglas de negocio)
// ------------------------------------------------------------
// En MVC, el Model es el dueño de los DATOS y de las REGLAS.
// Acá NO hay req/res (eso es del controller) ni URLs (eso es
// de las rutas). Solo sabe guardar, leer y validar tareas.
//
// Si cambia una regla del negocio (ej. un estatus nuevo,
// un campo obligatorio), se toca SOLO este archivo.
// ============================================================

const db = require('../db');

// Valores cerrados del estatus (normalización: Leo, clase 6)
// El estatus NO es texto libre: solo puede ser uno de estos 3.
const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'hecha'];

// ---------- Reglas de negocio (validaciones) ----------

// ¿El estatus recibido es válido?
function estatusValido(estatus) {
    return ESTADOS_VALIDOS.includes(estatus);
}

// ¿Los campos obligatorios están presentes?
// (nombre y responsable son obligatorios, según Leo clase 1)
function tieneCamposObligatorios(tarea) {
    return Boolean(tarea.nombre && tarea.responsable);
}

// ---------- Consultas a la base de datos (CRUD) ----------

// CREATE — insertar una tarea y devolverla completa (con su id)
function crearTarea({ nombre, responsable, estatus, descripcion }) {
    const estatusFinal = estatus || 'pendiente'; // default si no mandan estatus

    const result = db
        .prepare(
            'INSERT INTO tareas (nombre, responsable, estatus, descripcion) VALUES (?, ?, ?, ?)'
        )
        .run(nombre, responsable, estatusFinal, descripcion || '');

    // Vuelve a leer la tarea recién creada (con el id que generó la BD)
    return obtenerTareaPorId(result.lastInsertRowid);
}

// READ — listar tareas con filtros opcionales (nombre, responsable, estatus)
function listarTareas({ nombre, responsable, estatus } = {}) {
    // WHERE dinámico: se arma SOLO con los filtros que llegaron.
    // condiciones = los pedacitos de SQL ("nombre LIKE ?")
    // valores     = los valores reales, en el MISMO orden de los "?"
    const condiciones = [];
    const valores = [];

    // LIKE = "que contenga" (búsqueda parcial, no exacta)
    // %...%  = comodines: %pollo% matchea "pollo relleno", "pollo al verdeo", ...
    if (nombre) {
        condiciones.push('nombre LIKE ?');
        valores.push(`%${nombre}%`);
    }
    if (responsable) {
        condiciones.push('responsable LIKE ?');
        valores.push(`%${responsable}%`);
    }
    // El estatus NO lleva %: es igualdad exacta contra los valores cerrados
    if (estatus) {
        condiciones.push('estatus = ?');
        valores.push(estatus);
    }

    // Sin filtros → WHERE queda vacío → SELECT trae todo
    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    return db.prepare(`SELECT * FROM tareas ${where} ORDER BY id`).all(...valores);
}

// READ — obtener UNA tarea por su id (undefined si no existe)
function obtenerTareaPorId(id) {
    return db.prepare('SELECT * FROM tareas WHERE id = ?').get(Number(id));
}

// UPDATE — modificar tarea conservando los campos que no llegan.
// El MODELO valida ANTES de escribir (no guarda datos inválidos).
// Devuelve { tarea } si todo bien, o { error: 'not_found' } /
// { error: 'datos invalidos' } para que el controller elija el HTTP.
function actualizarTarea(id, { nombre, responsable, estatus, descripcion }) {
    // Primero necesita saber qué hay guardado (para conservar lo no enviado)
    const tarea = obtenerTareaPorId(id);
    if (!tarea) return { error: 'not_found' }; // no existe → 404

    // "??" = "si lo que vino es null/undefined, usá lo que ya había"
    const nombreFinal = nombre ?? tarea.nombre;
    const responsableFinal = responsable ?? tarea.responsable;
    const estatusFinal = estatus ?? tarea.estatus;
    const descripcionFinal = descripcion ?? tarea.descripcion;

    // Valida ANTES de escribir: no se guardan datos incompletos o raros
    if (!tieneCamposObligatorios({ nombre: nombreFinal, responsable: responsableFinal })) {
        return { error: 'datos invalidos', detalle: 'nombre y responsable no pueden quedar vacíos' };
    }
    if (!estatusValido(estatusFinal)) {
        return { error: 'datos invalidos', detalle: `Estatus inválido: debe ser ${ESTADOS_VALIDOS.join(', ')}` };
    }

    db.prepare(
        'UPDATE tareas SET nombre = ?, responsable = ?, estatus = ?, descripcion = ? WHERE id = ?'
    ).run(nombreFinal, responsableFinal, estatusFinal, descripcionFinal, tarea.id);

    // Devuelve la tarea ya actualizada
    return { tarea: obtenerTareaPorId(id) };
}

// DELETE — eliminar tarea; devuelve cuántas filas afectó (0 = no existía)
function eliminarTarea(id) {
    return db.prepare('DELETE FROM tareas WHERE id = ?').run(Number(id)).changes;
}

// Exporta SOLO las funciones: el controller no toca la base, habla con estas
module.exports = {
    ESTADOS_VALIDOS,
    estatusValido,
    tieneCamposObligatorios,
    crearTarea,
    listarTareas,
    obtenerTareaPorId,
    actualizarTarea,
    eliminarTarea
};