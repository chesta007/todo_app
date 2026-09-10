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

    // ---------- Ayudante: chequear la respuesta del backend ----------
    // Si el pedido no fue bien (400/404/500/...), lanza un Error con el
    // mensaje que mandó el backend (así el controller lo muestra en pantalla).
    async function respuestaJSON(response) {
        if (!response.ok) {
            const cuerpo = await response.json().catch(() => ({})); // si no trae JSON, igual seguimos
            throw new Error(cuerpo.error || `Error ${response.status}`);
        }
        // 204 = "todo bien pero sin contenido" (caso del borrado) → no hay JSON que leer
        if (response.status === 204) return null;
        return response.json();
    }

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
        return respuestaJSON(response); // convierte el JSON que llegó en objetos JS
    }

    // ---------- READ — traer UNA tarea por su id ----------
    async function leerTareaPorId(id) {
        const response = await fetch(`${API_URL}/${id}`);
        return respuestaJSON(response);
    }

    // ---------- CREATE — agregar tarea ----------
    async function crearTarea(datos) {
        const response = await fetch(API_URL, {
            method: 'POST',                                   // operación CRUD: Create
            headers: { 'Content-Type': 'application/json' },  // "te mando JSON"
            body: JSON.stringify(datos)                       // el objeto → texto JSON
        });
        return respuestaJSON(response);
    }

    // ---------- UPDATE — modificar tarea ----------
    async function actualizarTarea(id, datos) {
        const response = await fetch(`${API_URL}/${id}`, {   // la ruta lleva el :id al final
            method: 'PUT',                                    // operación CRUD: Update
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        return respuestaJSON(response);
    }

    // ---------- DELETE — eliminar tarea ----------
    async function eliminarTarea(id) {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); // operación CRUD: Delete
        await respuestaJSON(response); // si el backend no pudo (404), acá lanza el error
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