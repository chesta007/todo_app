import { Link } from 'react-router-dom'
import ChipEstatus from './ChipEstatus.tsx'
import { IconoEditar, IconoEliminar } from './Iconos.tsx'
import type { Estatus, Tarea } from '../tipos'

// TarjetaTarea — UNA tarea de la lista (era el div.task de view.js)
// ------------------------------------------------------------
// En vanilla: se construía con un template literal y se metía con
// innerHTML + escapeHtml() manual para evitar XSS.
// En React: JSX (HTML escrito en el componente) y el escape es
// AUTOMÁTICO — cualquier {texto} se muestra como texto, nunca como
// código. El escapeHtml de view.js desaparece por completo.
interface Props {
    tarea: Tarea;
    onCambiarEstatus: (id: number, estatus: Estatus) => void;
    onEditar: (tarea: Tarea) => void;
    onEliminar: (id: number) => void;
}

function TarjetaTarea({ tarea, onCambiarEstatus, onEditar, onEliminar }: Props) {
    return (
        <div className="task">
            <ChipEstatus estatus={tarea.estatus} id={tarea.id} onCambio={onCambiarEstatus} />

            {/* El nombre ahora es un Link de react-router: "no hay páginas,
                son rutas" — /tareas/13 abre el detalle SIN recargar el navegador */}
            <div className="task-nombre">
                <Link to={`/tareas/${tarea.id}`}>{tarea.nombre}</Link>
            </div>
            <div className="task-responsable">{tarea.responsable}</div>
            <div className="task-detalle">{tarea.descripcion || 'Sin descripción'}</div>

            <div className="task-actions">
                <button type="button" className="icon-btn" aria-label="Editar" title="Editar" onClick={() => onEditar(tarea)}>
                    <IconoEditar />
                </button>
                <button type="button" className="icon-btn" aria-label="Eliminar" title="Eliminar" onClick={() => onEliminar(tarea.id)}>
                    <IconoEliminar />
                </button>
            </div>
        </div>
    );
}

export default TarjetaTarea;