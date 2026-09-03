// ============================================================
// app.js — EL FRONTEND (lo que PIENSA la pantalla)
// ------------------------------------------------------------
// Trabaja en 2 movimientos:
//   1) PIDE datos al backend (fetch) → 2) PINTA en pantalla.
// La lista SIEMPRE se reconstruye desde el backend (GET):
// eso es "fuente única de verdad" — los datos viven en la BD,
// no duplicados acá (práctica de Leo, clase 8).
// ============================================================

const API_URL = 'http://localhost:3000/api/tareas'; // a dónde le habla al backend

// Estatus: valores guardados en la BD → etiquetas que se muestran
// (un "diccionario" = objeto que traduce código → texto legible)
const ESTADOS = {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    hecha: 'Hecha'
};

// Elementos del formulario: agarro las "cajitas" del HTML por su id
// (getElementById SIN # — ya sabe que es por id)
const form = document.getElementById('form-tarea');
const inputNombre = document.getElementById('input-nombre');
const inputResponsable = document.getElementById('input-responsable');
const selectEstatus = document.getElementById('select-estatus');
const inputDescripcion = document.getElementById('input-descripcion');
const btnAgregar = document.getElementById('btn-agregar');
const btnCancelar = document.getElementById('btn-cancelar');
const listaTareas = document.getElementById('lista-tareas');
const vacio = document.getElementById('vacio');
const contadorTotal = document.getElementById('contador-total');
const contadorAbiertas = document.getElementById('contador-abiertas');

// Elementos del BUSCADOR (tarea del jueves: filtros)
const formFiltro = document.getElementById('form-filtro');
const filtroNombre = document.getElementById('filtro-nombre');
const filtroResponsable = document.getElementById('filtro-responsable');
const filtroEstatus = document.getElementById('filtro-estatus');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

// Si se está editando una tarea, acá guardamos su id
// (let porque CAMBIA: null mientras no edito, un número mientras edito)
let editandoId = null;

// ---------- READ: traer las tareas (con filtros si los hay) y pintarlas ----------
async function cargarTareas() {
    // 1. Arma la URL: si hay filtros, los agrega como query params
    //    (?nombre=...&responsable=...&estatus=...) → el backend los usa en el WHERE
    //    URLSearchParams = la forma "oficial" de armar ?clave=valor&clave2=valor2
    const params = new URLSearchParams();
    if (filtroNombre.value.trim()) params.set('nombre', filtroNombre.value.trim());
    if (filtroResponsable.value.trim()) params.set('responsable', filtroResponsable.value.trim());
    if (filtroEstatus.value) params.set('estatus', filtroEstatus.value);
    const query = params.toString() ? `?${params.toString()}` : ''; // '' si no hay filtros

    // 2. fetch = "pedido al backend" · await = "esperá la respuesta"
    const response = await fetch(`${API_URL}${query}`); // GET (por defecto)
    const tareas = await response.json();     // convierte el JSON que llegó en objetos JS
    pintarTareas(tareas);                     // las dibuja en pantalla
}

// Arma las <option> del selector de estatus (con el valor actual seleccionado)
function opcionesEstatus(actual) {
    return Object.entries(ESTADOS)
        .map(([valor, etiqueta]) =>
            `<option value="${valor}" ${valor === actual ? 'selected' : ''}>${etiqueta}</option>`
        )
        .join('');
}

// Los íconos de los botones (SVG = dibujos vectoriales que se ven en cualquier pantalla)
const ICONO_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
const ICONO_ELIMINAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

// Pinta la lista: por CADA tarea que llega, crea una tarjeta (HTML dinámico)
function pintarTareas(tareas) {
    listaTareas.innerHTML = ''; // 1. limpia la lista (borra todo lo que había)

    // 2. ¿Está vacía? → mostrá el mensaje "No hay tareas"
    if (tareas.length === 0) {
        vacio.classList.remove('hidden');
    } else {
        vacio.classList.add('hidden');
    }

    // 3. Recorre el arreglo (for...of = "por cada tarea de la lista")
    for (const tarea of tareas) {
        const div = document.createElement('div'); // crea una cajita vacía
        div.className = 'task';                    // le da la clase (los estilos CSS)

        // Le mete el contenido adentro (template literal con `...`)
        // ${tarea.nombre} = el valor de ESE objeto de esta vuelta (no el último)
        div.innerHTML = `
            <span class="chip-wrap">
                <select class="chip estatus-${tarea.estatus}" data-id="${tarea.id}"
                        aria-label="Cambiar estatus">${opcionesEstatus(tarea.estatus)}</select>
            </span>
            <div class="task-nombre">${tarea.nombre}</div>
            <div class="task-responsable">${tarea.responsable}</div>
            <div class="task-detalle">${tarea.descripcion || 'Sin descripción'}</div>
            <div class="task-actions">
                <button class="icon-btn" data-accion="editar" data-id="${tarea.id}" aria-label="Editar" title="Editar">${ICONO_EDITAR}</button>
                <button class="icon-btn" data-accion="eliminar" data-id="${tarea.id}" aria-label="Eliminar" title="Eliminar">${ICONO_ELIMINAR}</button>
            </div>
        `;

        // data-id = guarda el id de la tarea en el botón para saber a cuál apuntar después
        listaTareas.appendChild(div); // 4. agrega la tarjeta a la lista
    }

    // Contadores (header + lista): se calculan de la lista, nunca números fijos
    const hechas = tareas.filter((t) => t.estatus === 'hecha').length; // ¿cuántas hechas?
    const abiertas = tareas.length - hechas;                          // el resto son abiertas
    contadorTotal.textContent = `${tareas.length} en total`;
    contadorAbiertas.textContent = `${abiertas} abiertas · ${hechas} hechas`;
}

// ---------- CREATE: agregar tarea ----------
async function agregarTarea(datos) {
    const response = await fetch(API_URL, {
        method: 'POST',                                   // operación CRUD: Create
        headers: { 'Content-Type': 'application/json' },  // "te mando JSON"
        body: JSON.stringify(datos)                       // el objeto → texto JSON
    });
    return response.json();
}

// ---------- UPDATE: modificar tarea ----------
async function modificarTarea(id, datos) {
    const response = await fetch(`${API_URL}/${id}`, {   // la ruta lleva el :id al final
        method: 'PUT',                                    // operación CRUD: Update
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    return response.json();
}

// ---------- DELETE: eliminar tarea ----------
async function eliminarTarea(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); // operación CRUD: Delete
}

// ---------- Eventos (los "oídos" del front) ----------

// Cuando se envía el formulario (botón "Agregar tarea" o Enter)
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // ❗ IMPORTA: evita que el navegador recargue la página
    // (sin esto, type="submit" manda el form al servidor y perdés todo)

    // Arma el objeto con lo que escribió el usuario (.trim() saca espacios de más)
    const datos = {
        nombre: inputNombre.value.trim(),
        responsable: inputResponsable.value.trim(),
        estatus: selectEstatus.value,
        descripcion: inputDescripcion.value.trim()
    };

    // ¿Estoy creando o editando? (editandoId = null → creando)
    if (editandoId === null) {
        await agregarTarea(datos);
    } else {
        await modificarTarea(editandoId, datos);
        editandoId = null;                       // termina el modo edición
        btnAgregar.textContent = 'Agregar tarea';
        btnCancelar.classList.add('hidden');
    }

    form.reset();            // limpia el formulario para la próxima
    selectEstatus.value = 'pendiente';
    await cargarTareas();    // vuelve a pedir TODO y repinta (fuente única de verdad)
});

// Cuando se toca un botón DENTRO de la lista (editar / eliminar)
// Se escucha en la lista (no en cada botón): "delegación de eventos"
listaTareas.addEventListener('click', async (event) => {
    const boton = event.target.closest('button[data-accion]'); // ¿tocaron un botón con data-accion?
    if (!boton) return; // si no, no hacemos nada

    const id = boton.dataset.id;      // qué tarea (el data-id que guardamos al pintar)
    const accion = boton.dataset.accion; // qué acción (editar | eliminar)

    if (accion === 'eliminar') {
        await eliminarTarea(id);
        await cargarTareas();
    }

    if (accion === 'editar') {
        // 1. Pide ESA tarea al backend (GET /api/tareas/:id)
        const response = await fetch(`${API_URL}/${id}`);
        const tarea = await response.json();

        // 2. Vuelca sus datos al formulario (para modificarlos)
        inputNombre.value = tarea.nombre;
        inputResponsable.value = tarea.responsable;
        selectEstatus.value = tarea.estatus;
        inputDescripcion.value = tarea.descripcion || '';

        // 3. Activa el "modo edición"
        editandoId = id;
        btnAgregar.textContent = 'Guardar cambios';
        btnCancelar.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // sube hasta el formulario
    }
});

// Cuando se cambia el chip de estatus de una tarea
listaTareas.addEventListener('change', async (event) => {
    const select = event.target.closest('.chip'); // ¿cambiaron un selector de estatus?
    if (!select) return;

    // Manda SOLO el estatus nuevo (PUT → el backend conserva el resto)
    await modificarTarea(select.dataset.id, { estatus: select.value });
    await cargarTareas();
});

// Cancelar edición (sin guardar)
btnCancelar.addEventListener('click', () => {
    editandoId = null;
    form.reset();
    selectEstatus.value = 'pendiente';
    btnAgregar.textContent = 'Agregar tarea';
    btnCancelar.classList.add('hidden');
});

// ---------- BUSCADOR (tarea del jueves: filtros) ----------

// Al enviar el formulario de búsqueda: vuelve a pedir al backend con los filtros
formFiltro.addEventListener('submit', (event) => {
    event.preventDefault(); // sin esto el navegador recargaría la página
    cargarTareas();
});

// "Limpiar": vuelve el buscador al estado inicial (form.reset() deja el select
// en "Pendiente", que es el default del HTML) y recarga. Para ver TODO,
// el usuario elige "Todas" en el desplegable de estatus.
btnLimpiarFiltros.addEventListener('click', () => {
    formFiltro.reset(); // vuelve todos los campos a su valor inicial
    cargarTareas();
});

// ---------- Arranque ----------
// Al abrir la página pide las tareas. Como el buscador arranca con
// estatus = "pendiente" (default del HTML), trae SOLO las pendientes,
// no todas (el problema de "¿y si tenés diez mil tareas?").
cargarTareas();