// ============================================================
// db.js — LA MEMORIA (capa 3: base de datos)
// ------------------------------------------------------------
// Abre (o crea) el archivo SQLite y define la tabla del modelo.
// Nadie más toca el archivo directamente: todo pasa por `db`.
// ============================================================

const { DatabaseSync } = require('node:sqlite'); // SQLite viene integrado en Node 24 (sin instalar nada)
const path = require('path');

// La base de datos se guarda como archivo en la carpeta del backend
const db = new DatabaseSync(path.join(__dirname, 'tareas.db'));

// Tabla del modelo tarea: id + los 4 campos que pidió Leo (creatividad permitida)
// IF NOT EXISTS = "solo la creo si todavía no existe" (no pisa datos al re-arrancar)
db.exec(`
    CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- id: lo genera SOLO la base (práctica de Leo, clase 6)
        nombre TEXT NOT NULL,                  -- qué hay que hacer (obligatorio)
        responsable TEXT NOT NULL,             -- quién la toma (obligatorio)
        estatus TEXT NOT NULL DEFAULT 'pendiente', -- valores cerrados: pendiente | en_progreso | hecha
        descripcion TEXT DEFAULT ''            -- detalle / notas (opcional)
    )
`);

// module.exports = "acá está la conexión, úsenla" — así routes/tareas.js la recibe
module.exports = db;