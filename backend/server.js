// ============================================================
// server.js — LA PUERTA DE ENTRADA DEL BACKEND (archivo de entrada)
// ------------------------------------------------------------
// Este archivo SOLO conecta las piezas: crea la app, habilita
// los middlewares y enruta el tráfico. No tiene lógica de negocio.
// Es chico a propósito (Leo criticó el server de 380 líneas).
// Levantar: npm start  →  escucha en http://localhost:3000
// ============================================================

const express = require('express');        // librería de backend (las 3 famosas: Express, Fastify, NestJS)
const cors = require('cors');              // deja que el frontend (otro proyecto) le pueda hablar
const tareasRouter = require('./routes/tareas'); // el "menú" CRUD, vive en otro archivo aparte

const app = express();                     // crea la aplicación Express
const PORT = 3000;                         // puerto donde escucha (http://localhost:3000)

// Middlewares: funciones que van "en el medio" de cada pedido
app.use(cors());                           // permite llamadas desde el frontend (otro proyecto/origen)
app.use(express.json());                   // entiende los JSON que llegan en el body de los request

// Rutas del único modelo de la app: tareas
// "Todo lo que llegue a /api/tareas, que lo maneje tareasRouter"
app.use('/api/tareas', tareasRouter);

// 404: ninguna ruta matcheó → respondemos JSON (Express por defecto respondía HTML)
// (así el frontend SIEMPRE puede hacer response.json() sin romperse)
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler global: atrapa cualquier error que pase en las rutas
// (como el JSON malformado) y responde SIEMPRE JSON, nunca HTML por defecto.
// OJO: lleva 4 parámetros (err, req, res, next) → así Express lo reconoce.
app.use((err, req, res, next) => {
    // express.json(): si el body trae un JSON inválido marca err.type === 'entity.parse.failed'
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido en el cuerpo del pedido' });
    }
    console.error(err); // dejá rastro en la consola para diagnosticar bugs
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Arranca el servidor y queda escuchando pedidos
app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
    console.log('Endpoints: GET/POST /api/tareas · GET/PUT/DELETE /api/tareas/:id');
    console.log('Comentarios (1 a N): GET/POST /api/tareas/:id/comentarios · DELETE /api/tareas/comentarios/:id');
});