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

// Arranca el servidor y queda escuchando pedidos
app.listen(PORT, () => {
    console.log(`Backend corriendo en http://localhost:${PORT}`);
    console.log(`Endpoints: GET/POST /api/tareas · GET/PUT/DELETE /api/tareas/:id`);
});