// ============================================================
// api.ts — EL MODELO (el "cable" al backend)
// ------------------------------------------------------------
// Es el equivalente a js/model.js de la versión vanilla: el ÚNICO
// lugar que usa fetch y conoce la URL de la API. Cambia muy poco:
//   • API_URL ahora es RELATIVA ('/api/tareas') porque Vite tiene
//     un proxy configurado: /api → http://localhost:3000
//   • las funciones devuelven los tipos definidos en tipos.ts
// Lo demás (manejo de errores, verbos HTTP, URLSearchParams)
// quedó IGUAL. Ese es el punto de la comparación: el model casi no
// cambia al pasar a React — cambia la VISTA.
// ============================================================

import type { Comentario, DatosTarea, Estatus, Filtros, Tarea } from './tipos';

const API_URL = '/api/tareas'; // con el proxy de Vite, /api llega al backend

// ---------- Ayudante: chequear la respuesta del backend ----------
// Si el pedido no fue bien (400/404/500/...), lanza un Error con el
// mensaje que mandó el backend (así la página lo muestra en pantalla).
async function respuestaJSON(response: Response): Promise<unknown> {
    if (!response.ok) {
        const cuerpo = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(cuerpo.error || `Error ${response.status}`);
    }
    // 204 = "todo bien pero sin contenido" (caso del borrado) → no hay JSON que leer
    if (response.status === 204) return null;
    return response.json();
}

// ---------- READ — traer las tareas (con filtros opcionales) ----------
export async function leerTareas(filtros: Filtros = {}): Promise<Tarea[]> {
    const params = new URLSearchParams();
    if (filtros.nombre) params.set('nombre', filtros.nombre);
    if (filtros.responsable) params.set('responsable', filtros.responsable);
    if (filtros.estatus) params.set('estatus', filtros.estatus);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_URL}${query}`); // GET (por defecto)
    return (await respuestaJSON(response)) as Tarea[];
}

// ---------- READ — traer UNA tarea por su id ----------
export async function leerTareaPorId(id: number): Promise<Tarea> {
    const response = await fetch(`${API_URL}/${id}`);
    return (await respuestaJSON(response)) as Tarea;
}

// ---------- CREATE — agregar tarea ----------
export async function crearTarea(datos: DatosTarea): Promise<Tarea> {
    const response = await fetch(API_URL, {
        method: 'POST', // operación CRUD: Create
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });
    return (await respuestaJSON(response)) as Tarea;
}

// ---------- UPDATE — modificar tarea (solo lo que se manda) ----------
export async function actualizarTarea(id: number, datos: Partial<DatosTarea>): Promise<Tarea> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH', // PATCH = actualización PARCIAL (el verbo correcto)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });
    return (await respuestaJSON(response)) as Tarea;
}

// ---------- DELETE — eliminar tarea ----------
export async function eliminarTarea(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    await respuestaJSON(response); // si el backend no pudo (404), acá lanza el error
}

// ---------- COMENTARIOS (relación 1 a N, Leo clase 13) ----------
export async function leerComentarios(tareaId: number): Promise<Comentario[]> {
    const response = await fetch(`${API_URL}/${tareaId}/comentarios`);
    return (await respuestaJSON(response)) as Comentario[];
}

export async function crearComentario(tareaId: number, datos: { autor: string; texto: string }): Promise<Comentario> {
    const response = await fetch(`${API_URL}/${tareaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    });
    return (await respuestaJSON(response)) as Comentario;
}

export async function eliminarComentario(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/comentarios/${id}`, { method: 'DELETE' });
    await respuestaJSON(response); // si no existía (404), acá lanza el error
}

// El estatus que manda el chip de una tarjeta es SOLO el estatus (PATCH parcial)
export async function cambiarEstatusTarea(id: number, estatus: Estatus): Promise<Tarea> {
    return actualizarTarea(id, { estatus });
}