import { useCallback, useEffect, useState } from 'react'
import Buscador from '../componentes/Buscador.tsx'
import FormularioTarea from '../componentes/FormularioTarea.tsx'
import MensajeError from '../componentes/MensajeError.tsx'
import TarjetaTarea from '../componentes/TarjetaTarea.tsx'
import {
    actualizarTarea,
    cambiarEstatusTarea,
    crearTarea,
    eliminarTarea,
    leerTareas,
} from '../api'
import type { DatosTarea, Estatus, Filtros, Tarea } from '../tipos'

// PaginaLista — LA LISTA (reemplaza a controller.js + view.js)
// ------------------------------------------------------------
// En vanilla el controller tenía UN estado mutable (editandoId) y
// pintaba con funciones (pintarLista, pintarContadores). El HTML de
// la pantalla vivía en index.html y las tarjetas se inyectaban con
// innerHTML.
// En React la página entera ES una función que retorna el HTML
// (JSX), y cada dato que cambia vive en un hook useState. Cuando el
// estado cambia, React redibuja SOLO lo que cambió (virtual DOM —
// lo que explicó Leo con el ejemplo de Facebook).
function PaginaLista() {
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [filtros, setFiltros] = useState<Filtros>({ estatus: 'pendiente' });
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [editando, setEditando] = useState<Tarea | null>(null);
    const [enviando, setEnviando] = useState(false);
    // Cambia después de cada guardado exitoso → recrea el formulario
    // (la key) y lo deja listo para una tarea nueva.
    const [formVersion, setFormVersion] = useState(0);

    // RECARGAR: pedir al backend con los filtros actuales y repintar.
    // useCallback = la función es la misma entre renders (para useEffect).
    const recargar = useCallback(async (filtrosActuales: Filtros) => {
        try {
            const datos = await leerTareas(filtrosActuales); // Model: trae datos
            setTareas(datos);                                // Estado: la lista cambia
            setMensaje(null);                                // todo ok → sin cartel
        } catch (error) {
            setMensaje(error instanceof Error ? error.message : 'Error desconocido');
        }
    }, []);

    // Al abrir la página (montar el componente): traer las tareas.
    // El buscador arranca con estatus = "pendiente" → solo pendientes,
    // no todas (el problema de "¿y si tenés diez mil tareas?").
    useEffect(() => {
        recargar(filtros);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- Acciones (los "event listeners" de vanilla) ----------

    // Guardar (crear o editar) — el anti doble-click era btn.disabled;
    // acá `enviando` deshabilita el botón mientras responde el backend.
    async function guardar(datos: DatosTarea) {
        setEnviando(true);
        try {
            if (editando === null) {
                await crearTarea(datos);       // POST
            } else {
                await actualizarTarea(editando.id, datos); // PATCH
            }
            setEditando(null);                 // termina el modo edición
            setFormVersion((v) => v + 1);      // recrea el form → vacío, listo para crear
            await recargar(filtros);           // fuente única de verdad
        } catch (error) {
            setMensaje(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setEnviando(false);                // pase lo que pase, habilitar
        }
    }

    async function eliminar(id: number) {
        try {
            await eliminarTarea(id);
            await recargar(filtros);
        } catch (error) {
            setMensaje(error instanceof Error ? error.message : 'Error desconocido');
        }
    }

    // El chip de estatus de una tarjeta manda SOLO el estatus (PATCH parcial)
    async function cambiarEstatus(id: number, estatus: Estatus) {
        try {
            await cambiarEstatusTarea(id, estatus);
        } catch (error) {
            setMensaje(error instanceof Error ? error.message : 'Error desconocido');
        }
        await recargar(filtros); // repinta con lo que quedó guardado (aunque haya fallado)
    }

    // El buscador: setFiltros + recargar con los filtros nuevos
    async function filtrar(filtrosNuevos: Filtros) {
        setFiltros(filtrosNuevos);
        await recargar(filtrosNuevos);
    }

    function cancelarEdicion() {
        setEditando(null);
        setMensaje(null);
    }

    // ---------- Contadores (eran pintarContadores en view.js) ----------
    // Se calculan de la lista actual, nunca números fijos.
    const hechas = tareas.filter((t) => t.estatus === 'hecha').length;
    const abiertas = tareas.length - hechas;

    return (
        <div className="page">
            <header className="header">
                <div className="header-brand">
                    <p className="kicker">Taller de tareas</p>
                    <h1 className="wordmark">Pizarra</h1>
                </div>
                <p className="header-counts">{abiertas} abiertas · {hechas} hechas</p>
            </header>

            <p className="intro">
                Una lista compartida: nombre, responsable, estatus y descripción. Sin cuentas. Lo que anotes
                queda en la base local.
            </p>

            <MensajeError mensaje={mensaje} />

            <main className="layout">
                <FormularioTarea
                    key={`${editando?.id ?? 'nueva'}-${formVersion}`}
                    editando={editando}
                    enviando={enviando}
                    onGuardar={guardar}
                    onCancelar={cancelarEdicion}
                />

                <section className="list-col">
                    <Buscador onFiltrar={filtrar} />

                    <div className="list-header">
                        <h2 className="card-title">Tareas</h2>
                        <span className="count">{tareas.length} en total</span>
                    </div>

                    {/* La lista: un componente por tarea (no innerHTML).
                        El "vacio" es render condicional: si no hay tareas
                        se dibuja el aviso; si hay, no existe. (El bug del
                        vanilla — que innerHTML='' borraba el aviso — no
                        puede pasar acá porque no hay innerHTML.) */}
                    <div className="task-list" aria-live="polite">
                        {tareas.length === 0 && (
                            <p className="empty">No hay tareas. Agregá la primera.</p>
                        )}
                        {tareas.map((tarea) => (
                            <TarjetaTarea
                                key={tarea.id}
                                tarea={tarea}
                                onCambiarEstatus={cambiarEstatus}
                                onEditar={setEditando}
                                onEliminar={eliminar}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default PaginaLista;