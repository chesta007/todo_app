// ============================================================
// tipos.ts — LOS TIPOS (TypeScript: el "contrato" de los datos)
// ------------------------------------------------------------
// En JS vanilla no existían: cualquier dato podía ser cualquier cosa.
// Con TS definimos UNA VEZ la forma de cada objeto y el editor
// (y el compilador) avisa si la rompemos. Es el mismo CONTRATO_TAREA
// que definimos en el backend (models/tarea.js), pero del lado front.
// ============================================================

// Los únicos estatus válidos (mismos valores que el backend)
export type Estatus = 'pendiente' | 'en_progreso' | 'hecha';

// La forma de una tarea (lo que devuelve GET /api/tareas)
export interface Tarea {
    id: number;
    nombre: string;
    responsable: string;
    estatus: Estatus;
    descripcion: string;
}

// La forma de un comentario (relación 1 a N, clase 13)
export interface Comentario {
    id: number;
    tarea_id: number;
    autor: string;
    texto: string;
    creado_en: string;
}

// Lo que manda el formulario al crear o editar
export interface DatosTarea {
    nombre: string;
    responsable: string;
    estatus: Estatus;
    descripcion: string;
}

// Los filtros del buscador ('' = "Todas" en el desplegable)
export interface Filtros {
    nombre?: string;
    responsable?: string;
    estatus?: Estatus | '';
}

// Traducción estatus → etiqueta legible (el "diccionario" de view.js)
export const ESTADOS: Record<Estatus, string> = {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    hecha: 'Hecha',
};