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

// Activa las claves foráneas (FK): sin esto SQLite las ignora y no las aplica.
// Necesario para que los comentarios "apunten" a una tarea real y se borren
// en cascada cuando la tarea se elimina.
db.exec('PRAGMA foreign_keys = ON');

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

// Tabla de comentarios: la relación "1 a N" que pidió Leo (clase 13).
// UNA tarea (padre) → MUCHOS comentarios (hijos). De Pablo, de Leo, de Pepito...
// tarea_id = la "llave foránea": apunta la tabla tareas. ON DELETE CASCADE =
// si se borra la tarea, SQLite borra solos sus comentarios (no quedan huérfanos).
db.exec(`
    CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- id del comentario (lo genera la base)
        tarea_id INTEGER NOT NULL,             -- a qué tarea pertenece (el padre del 1 a N)
        autor TEXT NOT NULL,                   -- quién escribió el comentario
        texto TEXT NOT NULL,                   -- el comentario en sí
        creado_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime')), -- cuándo (fecha y hora local)
        FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE
    )
`);

// module.exports = "acá está la conexión, úsenla" — así routes/tareas.js la recibe
module.exports = db;