// ============================================================
// routes/tareas.js — EL MENÚ CRUD (el corazón de la lógica)
// ------------------------------------------------------------
// Cada bloque = una operación del CRUD (Create, Read, Update, Delete).
// Los 3 personajes de cada operación:
//   req (request)  = lo que te MANDAN (el front)
//   res (response) = lo que vos RESPONDÉS (JSON)
//   db             = la memoria donde guardás / leés
// ============================================================

const express = require('express');
const db = require('../db');

const router = express.Router();

// Valores cerrados del estatus (normalización: Leo, clase 6)
// El estatus NO es texto libre: solo puede ser uno de estos 3.
const ESTADOS_VALIDOS = ['pendiente', 'en_progreso', 'hecha'];

// ---------- CREATE — crear una tarea (POST /api/tareas) ----------
router.post('/', (req, res) => {
    // 1. Saca del request lo que mandó el front (los 4 campos del modelo)
    const { nombre, responsable, estatus, descripcion } = req.body;

    // 2. Valida (defensivo, Leo clase 1): nombre y responsable son obligatorios
    if (!nombre || !responsable) {
        return res.status(400).json({ error: 'Faltan datos obligatorios: nombre y responsable' });
    }

    // 3. Valida el estatus contra la lista cerrada (normalización, Leo clase 6)
    const estatusFinal = estatus || 'pendiente'; // si no mandan estatus, usa el default
    if (!ESTADOS_VALIDOS.includes(estatusFinal)) {
        return res.status(400).json({ error: `Estatus inválido: debe ser ${ESTADOS_VALIDOS.join(', ')}` });
    }

    // 4. Guarda en la base de datos (los "?" son reemplazados por los valores, en orden)
    const result = db
        .prepare(
            'INSERT INTO tareas (nombre, responsable, estatus, descripcion) VALUES (?, ?, ?, ?)'
        )
        .run(nombre, responsable, estatusFinal, descripcion || '');

    // 5. Vuelve a leer la tarea recién creada (con su id generado por la BD)
    const nuevaTarea = db
        .prepare('SELECT * FROM tareas WHERE id = ?')
        .get(result.lastInsertRowid);

    // 6. Responde 201 (Created) con la tarea en JSON
    res.status(201).json(nuevaTarea);
});

// ---------- READ — listar (GET /api/tareas) ----------
// El jueves Leo explica SELECT ... WHERE: acá ya está adelantado.
// Los filtros llegan como query params en la URL:
//   /api/tareas?nombre=pollo&responsable=Ana&estatus=hecha
//   req.query = el objeto con esos filtros ({ nombre: 'pollo', ... })
router.get('/', (req, res) => {
    const { nombre, responsable, estatus } = req.query;

    // Defensivo: si el estatus viene pero no es uno de los cerrados → 400
    if (estatus && !ESTADOS_VALIDOS.includes(estatus)) {
        return res.status(400).json({ error: `Estatus inválido: debe ser ${ESTADOS_VALIDOS.join(', ')}` });
    }

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
    const tareas = db.prepare(`SELECT * FROM tareas ${where} ORDER BY id`).all(...valores);
    res.json(tareas); // responde un ARREGLO de objetos JSON
});

// ---------- READ — consultar una (GET /api/tareas/:id) ----------
// ":id" es un "comodín": /api/tareas/1, /api/tareas/2, etc.
router.get('/:id', (req, res) => {
    const tarea = db.prepare('SELECT * FROM tareas WHERE id = ?').get(Number(req.params.id));
    if (!tarea) {
        // No existe esa tarea → 404 (Not Found)
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(tarea); // existe → 200 con la tarea
});

// ---------- UPDATE — modificar una (PUT /api/tareas/:id) ----------
router.put('/:id', (req, res) => {
    // Primero busca si la tarea existe (si no, 404)
    const tarea = db.prepare('SELECT * FROM tareas WHERE id = ?').get(Number(req.params.id));
    if (!tarea) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const { nombre, responsable, estatus, descripcion } = req.body;

    // Defensivo: si no mandan un campo, se CONSERVA el valor actual
    // ("??" = "si lo que vino es null/undefined, usá lo que ya había")
    const nombreFinal = nombre ?? tarea.nombre;
    const responsableFinal = responsable ?? tarea.responsable;
    const estatusFinal = estatus ?? tarea.estatus;
    const descripcionFinal = descripcion ?? tarea.descripcion;

    // Valida que no queden vacíos (defensivo, Leo clase 1)
    if (!nombreFinal || !responsableFinal) {
        return res.status(400).json({ error: 'nombre y responsable no pueden quedar vacíos' });
    }

    // Valida el estatus contra la lista cerrada
    if (!ESTADOS_VALIDOS.includes(estatusFinal)) {
        return res.status(400).json({ error: `Estatus inválido: debe ser ${ESTADOS_VALIDOS.join(', ')}` });
    }

    // Actualiza la fila en la base
    db.prepare(
        'UPDATE tareas SET nombre = ?, responsable = ?, estatus = ?, descripcion = ? WHERE id = ?'
    ).run(
        nombreFinal,
        responsableFinal,
        estatusFinal,
        descripcionFinal,
        tarea.id
    );

    // Vuelve a leer la tarea actualizada y la responde
    const actualizada = db.prepare('SELECT * FROM tareas WHERE id = ?').get(tarea.id);
    res.json(actualizada);
});

// ---------- DELETE — eliminar una (DELETE /api/tareas/:id) ----------
router.delete('/:id', (req, res) => {
    // Ejecuta el borrado; "changes" dice cuántas filas afectó
    const result = db.prepare('DELETE FROM tareas WHERE id = ?').run(Number(req.params.id));
    if (result.changes === 0) {
        // No borró nada → esa tarea no existía → 404
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    // 204 (No Content) = "borrado, no tengo nada más que decirte"
    res.status(204).end();
});

// Exporta el router para que server.js lo conecte en /api/tareas
module.exports = router;