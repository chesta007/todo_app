// ============================================================
// js/detalle.js — EL CONTROLLER de la página de DETALLE (tarea.html)
// ------------------------------------------------------------
// Hermano del controller.js de index.html, pero para la vista de detalle:
//   1) Lee la URL (?id=...) para saber QUÉ tarea mostrar
//   2) Le pide la tarea + sus comentarios al Model (TareaModel)
//   3) Manda a pintar a la View (pintarDetalle / pintarComentarios)
//   4) Escucha el envio del comentario y los botones de borrar
// ============================================================

window.TareaDetalle = (function () {

    const model = window.TareaModel;
    const view = window.TareaView;

    // ---------- Qué tarea queremos ver: sale del ?id=... de la URL ----------
    // tarea.html?id=8  →  URLSearchParams lee "id" y nos da "8"
    const tareaId = new URLSearchParams(window.location.search).get('id');

    // Referencias al HTML de ESTA página
    const detalleTitulo = document.getElementById('detalle-titulo');
    const detalleCabecera = document.getElementById('detalle-cabecera');
    const detalleCuerpo = document.getElementById('detalle-cuerpo');
    const formComentario = document.getElementById('form-comentario');
    const inputAutor = document.getElementById('input-autor');
    const inputTexto = document.getElementById('input-texto');
    const btnComentar = formComentario.querySelector('.btn');
    const listaComentarios = document.getElementById('lista-comentarios');
    const vacioComentarios = document.getElementById('vacio-comentarios');
    const mensajeError = document.getElementById('mensaje-error');
    const seccionDetalle = document.getElementById('seccion-detalle');
    const seccionComentarios = document.getElementById('seccion-comentarios');

    // Recuerda el último nombre usado (para no retipearlo en cada comentario)
    inputAutor.value = localStorage.getItem('comentario-autor') || '';

    function mostrarError(msj) {
        mensajeError.textContent = msj || '';
        mensajeError.classList.toggle('hidden', !msj);
    }

    // Si la tarea no existe (o falta el id) no tiene sentido mostrar la ficha
    // ni el formulario de comentarios: los ocultamos. (El backend igual los
    // rechaza con 404, pero la pantalla no debe ofrecer algo que no va a funcionar.)
    function ocultarSecciones() {
        seccionDetalle.classList.add('hidden');
        seccionComentarios.classList.add('hidden');
    }

    // ¿Vino un id en la URL? Si no, no hay nada que mostrar.
    if (!tareaId) {
        detalleTitulo.textContent = 'Falta el id';
        mostrarError('Falta el id de la tarea en la URL. Volvé a la lista y hacé clic en el nombre.');
        ocultarSecciones();
        return;
    }

    // ---------- RECARGAR: tarea + sus comentarios, y repinta ----------
    async function recargar() {
        try {
            // 1. Model: trae LA tarea (GET /api/tareas/:id)
            const tarea = await model.leerTareaPorId(tareaId);

            // 2. View: dibuja el encabezado y la tarjeta de detalle
            detalleTitulo.textContent = tarea.nombre;
            detalleCabecera.textContent = `Tarea #${tarea.id}`;
            view.pintarDetalle(detalleCuerpo, tarea);

            // 3. Model: trae los comentarios de esa tarea (GET /api/tareas/:id/comentarios)
            const comentarios = await model.leerComentarios(tareaId);

            // 4. View: los dibuja (o el aviso "sin comentarios")
            view.pintarComentarios(listaComentarios, vacioComentarios, comentarios);

            mostrarError(null); // todo ok → sin cartel
        } catch (error) {
            // Tarea inexistente (404), backend apagado, etc. → avisá y ocultá las secciones
            mostrarError(error.message);
            detalleTitulo.textContent = 'Tarea no encontrada';
            ocultarSecciones();
        }
    }

    // ---------- EVENTO: enviar un comentario ----------
    formComentario.addEventListener('submit', async (event) => {
        event.preventDefault(); // evita que el navegador recargue la página

        const datos = {
            autor: inputAutor.value.trim(),
            texto: inputTexto.value.trim()
        };

        // Sin autor o texto, no vale la pena hablar con el backend
        if (!datos.autor || !datos.texto) {
            mostrarError('Autor y comentario no pueden quedar vacíos.');
            return;
        }

        // Guarda el nombre para la próxima vez (localStorage = memoria del navegador)
        localStorage.setItem('comentario-autor', datos.autor);

        // Protege contra el doble click
        btnComentar.disabled = true;
        btnComentar.textContent = 'Guardando…';

        try {
            await model.crearComentario(tareaId, datos); // POST /api/tareas/:id/comentarios
            formComentario.reset();                      // limpia (conserva el autor en localStorage)
            inputAutor.value = localStorage.getItem('comentario-autor') || '';
            await recargar();                            // repinta con el comentario nuevo arriba/menos
        } catch (error) {
            mostrarError(error.message);                 // p. ej. 400 por campos que faltan
        } finally {
            btnComentar.disabled = false;
            btnComentar.textContent = 'Agregar comentario';
        }
    });

    // ---------- EVENTO: botones dentro de la lista de comentarios ----------
    // Delegación de eventos: escuchamos en la lista, no en cada botón.
    // El id de QUÉ comentario borrar vive en data-id (lo pegó pintarComentarios).
    listaComentarios.addEventListener('click', async (event) => {
        const boton = event.target.closest('button[data-accion]'); // ¿tocaron un botón de acción?
        if (!boton || boton.dataset.accion !== 'eliminar-comentario') return;

        try {
            await model.eliminarComentario(boton.dataset.id); // DELETE /api/tareas/comentarios/:id
            await recargar();                                 // ya no está → repinta
        } catch (error) {
            mostrarError(error.message);                       // p. ej. ya lo habían borrado (404)
        }
    });

    // ---------- Arranque: carga la tarea y sus comentarios ----------
    recargar();

})();