# ORM — Investigación (solo lectura, no implementar)

> Tarea de Leo (martes 15/9, clase 13): investigar qué son los ORM.
> **No hay que implementar nada.** Decisión de Leo en la clase 12:
> _«por ahora no vamos a hacer nada de orm, vamos a terminar bien sql»._

---

## 1. ¿Qué es un ORM?

**ORM** = *Object Relational Mapping* (mapeo objeto-relacional).

Es una librería que **convierte las filas de la base en objetos** de tu lenguaje
(y al revés). En lugar de escribir SQL a mano:

```sql
INSERT INTO tareas (nombre, responsable) VALUES (?, ?)
```

con un ORM escribís algo como:

```js
await Tarea.create({ nombre: 'X', responsable: 'Ana' });
```

El ORM traduce eso a SQL por vos. Con SQL puro, el equivalente es el `.prepare(...).run(...)` que usa hoy `models/tarea.js`.

### ¿Qué sabe hacer?

| Capacidad | SQL a mano (hoy) | Con ORM |
|---|---|---|
| Crear/leer/actualizar/borrar | `INSERT/SELECT/UPDATE/DELETE` que escribís vos | `create/findAll/update/destroy` |
| Relaciones 1 a N (tarea → comentarios) | La FK y el `JOIN` los escribís vos | Se declaran una vez (`hasMany` / `belongsTo`) |
| Migraciones (cambiar la tabla sin borrar datos) | Scripts SQL a mano | Comandos automáticos |

### ¿Por qué Leo no lo quiere (todavía)?

Porque si el ORM te esconde el SQL, no entendés el SQL.
Leo está enseñando **"terminar bien SQL"** (hoy: relaciones con más de una tabla).
Un ORM te resuelve el `JOIN`, pero no te enseña cómo funciona.
Además, un ORM no reemplaza a SQL: **escribe SQL** — si no sabés SQL, no vas a
poder leer el SQL que el ORM genera (o arreglarlo cuando falle).

---

## 2. Los 3 candidatos más conocidos

### Sequelize
- **Lenguaje:** JavaScript puro (y TypeScript).
- **Viejo y probado:** años de uso, mucha documentación, muchos tutoriales.
- **Estilo:** promesas/async; modelos definidos como clases.
- **Bases:** SQLite, MySQL, PostgreSQL, MariaDB, MSSQL — **la más completa**.
- **Por qué calza con nosotros:** es el único de los 3 que usa JS puro. El proyecto
  de la app está en JS (Pablo, sin TypeScript). Con Sequelize, `models/tarea.js`
  definiría la tabla y los métodos quedarían casi iguales.

### TypeORM
- **Lenguaje:** TypeScript (funciona con JS pero está pensado para TS).
- **Estilo:** decoradores (`@Entity`, `@Column`) encima de las clases.
- **Bases:** MySQL, PostgreSQL, SQLite, etc.
- **Por qué no:** si Pablo no usa TypeScript todavía, un ORM que "vive" del tipo
  estático te fuerza a aprender las dos cosas al mismo tiempo.

### Prisma
- **Lenguaje:** TypeScript (genera sus propios tipos).
- **Estilo:** distinto — no definís clases, definís el **schema** en un archivo
  propio (`schema.prisma`) y Prisma genera el cliente de consultas.
- **Bases:** PostgreSQL, MySQL, SQLite, etc.
- **Por qué no:** es el más "mágico" de los tres: te aleja más del SQL (es el que
  más te esconde la base). Bueno para producción grande, malo para aprender.

## 3. Tabla comparativa rápida

| | Sequelize | TypeORM | Prisma |
|---|---|---|---|
| JavaScript puro | ✅ | ⚠️ (es de TS) | ❌ (es de TS) |
| Familiaridad (docs/tutoriales) | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Qué tan cerca del SQL te deja | media | media | la más lejos |
| SQLite | ✅ | ✅ | ✅ |
| Curva de aprendizaje | baja | media | media |

## 4. Conclusión

**Si algún día metemos ORM → Sequelize.** Es el único que se siente natural en
JavaScript puro, el más completo en bases (ya viene con soporte MySQL para el
proyecto del hotel si lo usáramos ahí) y el que menos le roba protagonismo al SQL.

Antes de eso: Leo dijo "terminar bien SQL". La tarea de hoy (relación 1 a N con
comentarios) se resuelve **a mano**, con FK y JOINs, para entender qué es lo que
un ORM haría solo por nosotros.

## 5. ¿Y si un día querés ver cómo quedaría?

Ejemplo mental con Sequelize (no está en el proyecto, solo cómo se vería):
el día que debata con Leo, el model `tarea.js` declararía:

```js
// concepto — no está implementado en este proyecto
const Tarea = sequelize.define('tarea', {
    nombre:      { type: DataTypes.STRING, allowNull: false },
    responsable: { type: DataTypes.STRING, allowNull: false },
    estatus:     { type: DataTypes.STRING, defaultValue: 'pendiente' },
    descripcion: { type: DataTypes.STRING, defaultValue: '' }
});
Tarea.hasMany(Comentario);            // la relación 1 a N que hoy armamos con FK a mano
```