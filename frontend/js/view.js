// ============================================================
// js/view.js — LA VISTA (frontend: lo que ve el usuario)
// ------------------------------------------------------------
// En MVC, la View es la dueña del DOM (el HTML de la página):
// crea las tarjetas, los contadores, las opciones del select.
// NO sabe de dónde vienen los datos (eso es del Model) ni qué
// eventos hay (eso es del controller).
//
// Acá NO hay fetch ni addEventListener: solo pintar.
// ============================================================

window.TareaView = (function () {

    // Estatus: valores guardados en la BD → etiquetas que se muestran
    // (un "diccionario" = objeto que traduce código → texto legible)
    const ESTADOS = {
        pendiente: 'Pendiente',
        en_progreso: 'En progreso',
        hecha: 'Hecha'
    };

    // Los íconos de los botones (SVG = dibujos vectoriales que se ven en cualquier pantalla)
    const ICONO_EDITAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    const ICONO_ELIMINAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

    // Arma las <option> del selector de estatus (con el valor actual seleccionado)
    function opcionesEstatus(actual) {
        return Object.entries(ESTADOS)
            .map(([valor, etiqueta]) =>
                `<option value="${valor}" ${valor === actual ? 'selected' : ''}>${etiqueta}</option>`
            )
            .join('');
    }

    // Pinta la lista: por CADA tarea que llega, crea una tarjeta (HTML dinámico)
    function pintarLista(contenedor, vacio, tareas) {
        contenedor.innerHTML = ''; // 1. limpia la lista (borra todo lo que había)

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
            contenedor.appendChild(div); // 4. agrega la tarjeta a la lista
        }
    }

    // Actualiza los contadores del header + lista (se calculan de la lista, nunca números fijos)
    function pintarContadores(contadorTotal, contadorAbiertas, tareas) {
        const hechas = tareas.filter((t) => t.estatus === 'hecha').length; // ¿cuántas hechas?
        const abiertas = tareas.length - hechas;                          // el resto son abiertas
        contadorTotal.textContent = `${tareas.length} en total`;
        contadorAbiertas.textContent = `${abiertas} abiertas · ${hechas} hechas`;
    }

    // Carga una tarea EN el formulario (modo edición)
    function volcarEnFormulario(campos, tarea) {
        campos.nombre.value = tarea.nombre;
        campos.responsable.value = tarea.responsable;
        campos.estatus.value = tarea.estatus;
        campos.descripcion.value = tarea.descripcion || '';
    }

    // Marca el botón "Agregar tarea" como modo guardar (o vuelve a agregar)
    function modoBoton(btnAgregar, btnCancelar, editando) {
        if (editando) {
            btnAgregar.textContent = 'Guardar cambios';
            btnCancelar.classList.remove('hidden');
        } else {
            btnAgregar.textContent = 'Agregar tarea';
            btnCancelar.classList.add('hidden');
        }
    }

    // Lo que el resto del front puede usar (el controller)
    return {
        pintarLista,
        pintarContadores,
        volcarEnFormulario,
        modoBoton
    };
})();