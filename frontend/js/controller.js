// ============================================================
// js/controller.js — EL CONTROLLER (frontend: el "director")
// ------------------------------------------------------------
// En MVC, el Controller es el que conecta Model con View:
//   1) ESCUCHA los eventos del usuario (submit, click, change)
//   2) LE PIDE los datos al Model (TareaModel, sin fetch directo)
//   3) MANDA a pintar a la View (TareaView)
// NO guarda datos (eso es del Model) ni crea HTML (eso es de la View).
// ============================================================

window.TareaController = (function () {

    const model = window.TareaModel; // el "cable a la API"
    const view = window.TareaView;   // la "pantalla"

    // Estado de edición: null = creando · un número = editando esa tarea
    // (let porque CAMBIA con el tiempo)
    let editandoId = null;

    // Referencias al HTML (agarro las "cajitas" por su id UNA VEZ)
    const form = document.getElementById('form-tarea');
    const camposForm = {
        nombre: document.getElementById('input-nombre'),
        responsable: document.getElementById('input-responsable'),
        estatus: document.getElementById('select-estatus'),
        descripcion: document.getElementById('input-descripcion')
    };
    const btnAgregar = document.getElementById('btn-agregar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const listaTareas = document.getElementById('lista-tareas');
    const vacio = document.getElementById('vacio');
    const contadorTotal = document.getElementById('contador-total');
    const contadorAbiertas = document.getElementById('contador-abiertas');

    const formFiltro = document.getElementById('form-filtro');
    const camposFiltro = {
        nombre: document.getElementById('filtro-nombre'),
        responsable: document.getElementById('filtro-responsable'),
        estatus: document.getElementById('filtro-estatus')
    };
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

    // ---------- LEER los filtros actuales del buscador ----------
    function filtrosActuales() {
        return {
            nombre: camposFiltro.nombre.value.trim() || undefined,
            responsable: camposFiltro.responsable.value.trim() || undefined,
            estatus: camposFiltro.estatus.value || undefined
        };
    }

    // ---------- RECARGAR: pide al Model y repinta con la View ----------
    async function recargar() {
        const tareas = await model.leerTareas(filtrosActuales()); // Model: trae datos
        view.pintarLista(listaTareas, vacio, tareas);             // View: dibuja tarjetas
        view.pintarContadores(contadorTotal, contadorAbiertas, tareas); // View: contadores
    }

    // ---------- EVENTO: envío del formulario (agregar o guardar edición) ----------
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // ❗ IMPORTA: evita que el navegador recargue la página
        // (sin esto, type="submit" manda el form al servidor y perdés todo)

        // Arma el objeto con lo que escribió el usuario (.trim() saca espacios de más)
        const datos = {
            nombre: camposForm.nombre.value.trim(),
            responsable: camposForm.responsable.value.trim(),
            estatus: camposForm.estatus.value,
            descripcion: camposForm.descripcion.value.trim()
        };

        // ¿Estoy creando o editando? (editandoId = null → creando)
        if (editandoId === null) {
            await model.crearTarea(datos);
        } else {
            await model.actualizarTarea(editandoId, datos);
            editandoId = null;                       // termina el modo edición
            view.modoBoton(btnAgregar, btnCancelar, false);
        }

        form.reset();            // limpia el formulario para la próxima
        camposForm.estatus.value = 'pendiente';
        await recargar();        // vuelve a pedir TODO y repinta (fuente única de verdad)
    });

    // ---------- EVENTO: botones DENTRO de la lista (editar / eliminar) ----------
    // Se escucha en la lista (no en cada botón): "delegación de eventos"
    listaTareas.addEventListener('click', async (event) => {
        const boton = event.target.closest('button[data-accion]'); // ¿tocaron un botón con data-accion?
        if (!boton) return; // si no, no hacemos nada

        const id = boton.dataset.id;      // qué tarea (el data-id que guardamos al pintar)
        const accion = boton.dataset.accion; // qué acción (editar | eliminar)

        if (accion === 'eliminar') {
            await model.eliminarTarea(id);
            await recargar();
        }

        if (accion === 'editar') {
            // 1. Model: pide ESA tarea al backend (GET /api/tareas/:id)
            const tarea = await model.leerTareaPorId(id);

            // 2. View: vuelca sus datos al formulario (para modificarlos)
            view.volcarEnFormulario(camposForm, tarea);

            // 3. Activa el "modo edición"
            editandoId = id;
            view.modoBoton(btnAgregar, btnCancelar, true);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // sube hasta el formulario
        }
    });

    // ---------- EVENTO: cambio del chip de estatus de una tarea ----------
    listaTareas.addEventListener('change', async (event) => {
        const select = event.target.closest('.chip'); // ¿cambiaron un selector de estatus?
        if (!select) return;

        // Manda SOLO el estatus nuevo (PUT → el backend conserva el resto)
        await model.actualizarTarea(select.dataset.id, { estatus: select.value });
        await recargar();
    });

    // ---------- EVENTO: cancelar edición (sin guardar) ----------
    btnCancelar.addEventListener('click', () => {
        editandoId = null;
        form.reset();
        camposForm.estatus.value = 'pendiente';
        view.modoBoton(btnAgregar, btnCancelar, false);
    });

    // ---------- EVENTO: buscador (filtros) ----------
    // Al enviar el formulario de búsqueda: vuelve a pedir al backend con los filtros
    formFiltro.addEventListener('submit', (event) => {
        event.preventDefault(); // sin esto el navegador recargaría la página
        recargar();
    });

    // "Limpiar": vuelve el buscador al estado inicial (form.reset() deja el select
    // en "Pendiente", que es el default del HTML) y recarga. Para ver TODO,
    // el usuario elige "Todas" en el desplegable de estatus.
    btnLimpiarFiltros.addEventListener('click', () => {
        formFiltro.reset(); // vuelve todos los campos a su valor inicial
        recargar();
    });

    // ---------- Arranque ----------
    // Al abrir la página pide las tareas. Como el buscador arranca con
    // estatus = "pendiente" (default del HTML), trae SOLO las pendientes,
    // no todas (el problema de "¿y si tenés diez mil tareas?").
    recargar();

})();