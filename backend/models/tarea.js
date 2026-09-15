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

// ---------- DTO (Data Transfer Object): el CONTRATO de una tarea ----------
// Describe QUÉ es una tarea para la API: qué campos existen y de qué tipo.
// Todo lo que entra por el body (POST/PUT) se chequea contra esto: si llega
// un campo que NO está en el contrato → 400 (petición de Leo, clase 13).
const CONTRATO_TAREA = {
    nombre:      { tipo: 'string', obligatorio: true  },
    responsable: { tipo: 'string', obligatorio: true  },
    estatus:     { tipo: 'string', obligatorio: false, valores: ESTADOS_VALIDOS },
    descripcion: { tipo: 'string', obligatorio: false }
};

// ¿Un campo "vino" en el body? (undefined y null se tratan como "no vino":
// en un UPDATE parcial significa "este campo no se toca", no mandar vacío)
function campoPresente(valor) {
    return valor !== undefined && valor !== null;
}

// Valida un body contra el CONTRATO. Devuelve un ARREGLO de errores (vacío = todo bien).
// crear=true (POST): exige los campos obligatorios. crear=false (PUT parcial):
// valida únicamente lo que llegó (lo que no vino, no se toca).
function erroresContrato(datos, { crear = false } = {}) {
    const errores = [];

    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        return ['El cuerpo debe ser un objeto JSON'];
    }

    // 1. ¿Llegó algún campo que NO está en el contrato? → 400
    //    (si te mandan un "telefono", no es una tarea → rechazá, no lo guardes)
    for (const campo of Object.keys(datos)) {
        if (!(campo in CONTRATO_TAREA)) {
            errores.push(`Campo no permitido: "${campo}" (no está en el contrato de tarea)`);
        }
    }

    // 2. Por cada campo del contrato que vino: ¿tipo correcto? ¿valor válido?
    for (const [campo, regla] of Object.entries(CONTRATO_TAREA)) {
        if (!campoPresente(datos[campo])) {
            if (crear && regla.obligatorio) {
                errores.push(`Falta el campo obligatorio: ${campo}`);
            }
            continue; // no vino → nada que validar
        }

        if (typeof datos[campo] !== regla.tipo) {
            errores.push(`Campo "${campo}" debe ser ${regla.tipo}`);
            continue; // ya quedó marcado el error, no seguimos juzgando el valor
        }

        if (regla.valores && !regla.valores.includes(datos[campo])) {
            errores.push(`Campo "${campo}" debe ser uno de: ${regla.valores.join(', ')}`);
        }

        // Los obligatorios no pueden quedarse vacíos ("   " se rechaza, Leo 8/9).
        // Los opcionales sí pueden venir vacíos (p. ej. descripcion = "").
        if (regla.tipo === 'string' && regla.obligatorio && datos[campo].trim() === '') {
            errores.push(`Campo "${campo}" no puede quedar vacío`);
        }
    }

    return errores;
}

// ---------- Consultas a la base de datos (CRUD) ----------

// CREATE — insertar una tarea y devolverla completa (con su id)
function crearTarea({ nombre, responsable, estatus, descripcion }) {
    // trim: normaliza antes de guardar → datos limpios, sin "espacios de más"
    // (la validación rechaza "   ", pero " Ana " también conviene guardarla como "Ana")
    const nombreFinal = nombre.trim();
    const responsableFinal = responsable.trim();
    const estatusFinal = estatus || 'pendiente'; // default si no mandan estatus
    const descripcionFinal = descripcion ? descripcion.trim() : '';

    const result = db
        .prepare(
            'INSERT INTO tareas (nombre, responsable, estatus, descripcion) VALUES (?, ?, ?, ?)'
        )
        .run(nombreFinal, responsableFinal, estatusFinal, descripcionFinal);

    // Vuelve a leer la tarea recién creada (con el id que generó la BD)
    return obtenerTareaPorId(result.lastInsertRowid);
}

// ---------- Ayudante del buscador ----------
// El usuario escribe "%" o "_" → en LIKE son comodines (matchearían de más).
// escapeLike los convierte en texto literal: \%, \_
function escapeLike(texto) {
    return texto.replace(/[%_]/g, (char) => `\\${char}`);
}

// ¿El filtro es texto usable? (descarta arrays de Express y números)
function textoFiltro(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
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
    // OJO: se escapa %, _ y se descartan los filtros que tras limpiar quedaron vacíos
    // (un filtro "   " matchearía casi todo → se ignora)
    const nombreBusqueda = textoFiltro(nombre);
    const responsableBusqueda = textoFiltro(responsable);

    if (nombreBusqueda) {
        condiciones.push("nombre LIKE ? ESCAPE '\\'");
        valores.push(`%${escapeLike(nombreBusqueda)}%`);
    }
    if (responsableBusqueda) {
        condiciones.push("responsable LIKE ? ESCAPE '\\'");
        valores.push(`%${escapeLike(responsableBusqueda)}%`);
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

// UPDATE — modificar tarea SOLO con los campos que llegaron (actualizar parcial, Leo clase 13).
// Antes escribía SIEMPRE los 4 campos; ahora arma el SET con únicamente lo que se mandó:
//   si mandás solo { nombre } → UPDATE ... SET nombre = ?
//   si mandás { nombre, responsable } → UPDATE ... SET nombre = ?, responsable = ?
// Devuelve { tarea } si todo bien, o { error: 'not_found' } /
// { error: 'datos invalidos' } para que el controller elija el HTTP.
function actualizarTarea(id, cambios) {
    // Primero necesita saber que la tarea existe (si no, nada que actualizar)
    const tarea = obtenerTareaPorId(id);
    if (!tarea) return { error: 'not_found' }; // no existe → 404

    // Valida ANTES de escribir contra el contrato (lo que llegó).
    // Nada de guardar datos incompletos o campos desconocidos (Leo, clase 13).
    const errores = erroresContrato(cambios);
    if (errores.length > 0) {
        return { error: 'datos invalidos', detalle: errores.join(' · ') };
    }

    // SET dinámico: un "campo = ?" por cada campo que SÍ vino en el body
    const sets = [];
    const valores = [];
    for (const [campo, regla] of Object.entries(CONTRATO_TAREA)) {
        if (!campoPresente(cambios[campo])) continue; // no vino → no se toca

        sets.push(`${campo} = ?`);
        // trim al guardar: normaliza los valores (datos limpios, sin espacios de más).
        // La descripcion vacía se guarda como '' (no null).
        const valor = String(cambios[campo]).trim();
        valores.push(campo === 'descripcion' ? (valor || '') : valor);
    }

    // ¿Vino al menos una CLAVE aunque sea con null? (`{}` no trae ninguna)
    const tieneClaves = Object.keys(cambios || {}).length > 0;

    // Un body que no trae NINGÚN campo no tiene qué actualizar → 400.
    // Pero si trae claves solo con null, esos null significan "conservar"
    // (comportamiento documentado: null → 200 conserva, no romper ese test):
    // nada que tocar → devolver la tarea tal cual.
    if (sets.length === 0) {
        if (!tieneClaves) {
            return { error: 'datos invalidos', detalle: 'No hay campos para actualizar' };
        }
        return { tarea };
    }

    // Actualiza solo esas columnas (los demás campos de la fila quedan intactos)
    db.prepare(`UPDATE tareas SET ${sets.join(', ')} WHERE id = ?`).run(...valores, tarea.id);

    // Devuelve la tarea ya actualizada
    return { tarea: obtenerTareaPorId(id) };
}

// DELETE — eliminar tarea; devuelve cuántas filas afectó (0 = no existía)
function eliminarTarea(id) {
    return db.prepare('DELETE FROM tareas WHERE id = ?').run(Number(id)).changes;
}

// Exporta SOLO lo que el controller necesita (no toca la base directamente)
module.exports = {
    ESTADOS_VALIDOS,
    estatusValido,
    erroresContrato,
    crearTarea,
    listarTareas,
    obtenerTareaPorId,
    actualizarTarea,
    eliminarTarea
};