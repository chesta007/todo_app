// ============================================================
// js/model.js — EL MODELO (frontend: el "cable" al backend)
// ------------------------------------------------------------
// En MVC, el Model es el que sabe de dónde salen los DATOS.
// Acá el único lugar que usa fetch() y conoce la URL de la API.
// El controller NO sabe que la API existe: le pide a este model.
//
// Si mañana la API cambia de dirección o de formato, se toca
// SOLO este archivo.
//
// Como el front se carga con <script> común (no módulos), todo
// se "cuelga" del objeto global window → TareaModel.
// ============================================================

window.TareaModel = (function () {

    const API_URL = 'http://localhost:3000/api/tareas'; // a dónde le habla al backend

    // ---------- READ — traer las tareas (con filtros opcionales) ----------
    // filtros = { nombre, responsable, estatus } → arma ?nombre=...&responsable=...
    // URLSearchParams = la forma "oficial" de armar ?clave=valor&clave2=valor2
    async function leerTareas({ nombre, responsable, estatus } = {}) {
        const params = new URLSearchParams();
        if (nombre) params.set('nombre', nombre);
        if (responsable) params.set('responsable', responsable);
        if (estatus) params.set('estatus', estatus);
        const query = params.toString() ? `?${params.toString()}` : ''; // '' si no hay filtros

        const response = await fetch(`${API_URL}${query}`); // GET (por defecto)
        return response.json(); // convierte el JSON que llegó en objetos JS
    }

    // ---------- READ — traer UNA tarea por su id ----------
    async function leerTareaPorId(id) {
        const response = await fetch(`${API_URL}/${id}`);
        return response.json();
    }

    // ---------- CREATE — agregar tarea ----------
    async function crearTarea(datos) {
        const response = await fetch(API_URL, {
            method: 'POST',                                   // operación CRUD: Create
            headers: { 'Content-Type': 'application/json' },  // "te mando JSON"
            body: JSON.stringify(datos)                       // el objeto → texto JSON
        });
        return response.json();
    }

    // ---------- UPDATE — modificar tarea ----------
    async function actualizarTarea(id, datos) {
        const response = await fetch(`${API_URL}/${id}`, {   // la ruta lleva el :id al final
            method: 'PUT',                                    // operación CRUD: Update
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        return response.json();
    }

    // ---------- DELETE — eliminar tarea ----------
    async function eliminarTarea(id) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); // operación CRUD: Delete
    }

    // Lo que el resto del front puede usar (el controller)
    return {
        leerTareas,
        leerTareaPorId,
        crearTarea,
        actualizarTarea,
        eliminarTarea
    };
})();