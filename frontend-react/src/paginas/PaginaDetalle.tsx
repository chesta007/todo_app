import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MensajeError from '../componentes/MensajeError.tsx'
import TarjetaComentario from '../componentes/TarjetaComentario.tsx'
import { crearComentario, eliminarComentario, leerComentarios, leerTareaPorId } from '../api'
import { ESTADOS } from '../tipos'
import type { Comentario, Tarea } from '../tipos'

// PaginaDetalle — EL DETALLE de una tarea + sus comentarios
// ------------------------------------------------------------
// En vanilla: js/detalle.js leía ?id= de la URL con URLSearchParams,
// ocultaba secciones con classList y pintaba con innerHTML.
// En React: useParams() lee el :id de la ruta /tareas/:id, y las
// "secciones ocultas" son renders condicionales: si la tarea no
// existe, las secciones simplemente no se dibujan (el equivalente
// a ocultarSecciones(), sin classList).
const CLAVE_AUTOR = 'comentario-autor'; // la misma key de localStorage que el vanilla

function PaginaDetalle() {
    const { id } = useParams<{ id: string }>(); // ":id" de la ruta /tareas/:id
    const tareaId = Number(id);                  // "13" → 13

    // El id es válido si llegó un número entero positivo ("13" → 13)
    const idValido = Number.isInteger(tareaId) && tareaId > 0;

    const [tarea, setTarea] = useState<Tarea | null>(null);          // null = no encontrada
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [autor, setAutor] = useState(() => localStorage.getItem(CLAVE_AUTOR) || '');
    const [texto, setTexto] = useState('');
    const [enviando, setEnviando] = useState(false);

    // RECARGAR: traer la tarea + sus comentarios (como recargar() de detalle.js)
    const recargar = useCallback(async () => {
        try {
            const datos = await leerTareaPorId(tareaId);        // GET /api/tareas/:id
            const comentariosDeLaTarea = await leerComentarios(tareaId); // GET .../comentarios
            setTarea(datos);
            setComentarios(comentariosDeLaTarea);
            setError(null);
        } catch (err) {
            // Tarea inexistente (404), backend apagado, etc. → avisá y
            // dejá las secciones SIN dibujar (tarea sigue null)
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setTarea(null);
        }
    }, [tareaId]);

    // Al abrir la página: cargar. Si no vino un id válido, no hay nada que pedir.
    // Patrón de React para datos al montar: la función async se define
    // ADENTRO del effect (el setState ocurre después del await, no
    // síncrono — no dispara renders en cascada).
    useEffect(() => {
        if (!idValido) return;
        async function cargar() {
            try {
                const datos = await leerTareaPorId(tareaId);
                const comentariosDeLaTarea = await leerComentarios(tareaId);
                setTarea(datos);
                setComentarios(comentariosDeLaTarea);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
                setTarea(null);
            }
        }
        cargar();
    }, [idValido, tareaId]);

    // ---------- Enviar un comentario ----------
    async function enviarComentario(event: React.FormEvent) {
        event.preventDefault(); // sin recarga de página

        const datos = { autor: autor.trim(), texto: texto.trim() };

        // Sin autor o texto, no vale la pena hablar con el backend
        if (!datos.autor || !datos.texto) {
            setError('Autor y comentario no pueden quedar vacíos.');
            return;
        }

        // Guarda el nombre para la próxima vez (localStorage)
        localStorage.setItem(CLAVE_AUTOR, datos.autor);

        setEnviando(true); // anti doble-click
        try {
            await crearComentario(tareaId, datos); // POST /api/tareas/:id/comentarios
            setTexto('');                          // limpia (conserva el autor)
            await recargar();                      // repinta con el comentario nuevo
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setEnviando(false);
        }
    }

    async function borrarComentario(idComentario: number) {
        try {
            await eliminarComentario(idComentario); // DELETE /api/tareas/comentarios/:id
            await recargar();                       // ya no está → repinta
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    }

    // ---------- Título y mensaje: se DERIVAN del estado, no se guardan aparte ----------
    // (en vanilla eran detalleTitulo.textContent = ...; acá se calculan en cada render)
    // Mientras carga: sin tarea y sin error → "…" · Error (404, backend caído) → "no encontrada"
    const titulo = !idValido ? 'Falta el id' : tarea ? tarea.nombre : error ? 'Tarea no encontrada' : '…';
    const mensaje = !idValido
        ? 'Falta el id de la tarea en la URL. Volvé a la lista y hacé clic en el nombre.'
        : error;

    // Si la tarea no existe, las secciones no se dibujan (era ocultarSecciones)
    const hayTarea = tarea !== null;

    return (
        <div className="page">
            <header className="header">
                <div className="header-brand">
                    <Link className="back" to="/">
                        ← Volver a la pizarra
                    </Link>
                    <p className="kicker">Detalle de tarea</p>
                    <h1 className="wordmark">{titulo}</h1>
                </div>
            </header>

            <MensajeError mensaje={mensaje} />

            <main className="layout-detalle">
                {hayTarea && (
                    <section className="card detalle-card">
                        <h2 className="card-title">Tarea #{tarea.id}</h2>
                        <span className={`chip chip-static estatus-${tarea.estatus}`}>
                            {ESTADOS[tarea.estatus]}
                        </span>
                        <h2 className="detalle-nombre">{tarea.nombre}</h2>
                        <p className="detalle-responsable">
                            A cargo de <strong>{tarea.responsable}</strong>
                        </p>
                        <p className="detalle-descripcion">{tarea.descripcion || 'Sin descripción.'}</p>
                    </section>
                )}

                {hayTarea && (
                    <section className="card">
                        <h2 className="card-title">Comentarios</h2>

                        <form onSubmit={enviarComentario}>
                            <div className="field">
                                <label htmlFor="input-autor">Tu nombre</label>
                                <input
                                    type="text"
                                    id="input-autor"
                                    placeholder="Pablo, Leo, Pepito…"
                                    required
                                    value={autor}
                                    onChange={(e) => setAutor(e.target.value)}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="input-texto">Comentario</label>
                                <textarea
                                    id="input-texto"
                                    rows={3}
                                    placeholder="Qué hay que anotar de esta tarea"
                                    required
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={enviando}>
                                {enviando ? 'Guardando…' : 'Agregar comentario'}
                            </button>
                        </form>

                        <div className="comentarios" aria-live="polite">
                            {comentarios.length === 0 && (
                                <p className="empty">Sin comentarios todavía.</p>
                            )}
                            {comentarios.map((comentario) => (
                                <TarjetaComentario
                                    key={comentario.id}
                                    comentario={comentario}
                                    onEliminar={borrarComentario}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default PaginaDetalle;