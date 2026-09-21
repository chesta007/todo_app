import { IconoEliminar } from './Iconos.tsx'
import type { Comentario } from '../tipos'

// TarjetaComentario — UN comentario (era el div.comentario de view.js)
// ------------------------------------------------------------
// Igual que TarjetaTarea: en vanilla era un template literal con
// escapeHtml() en autor, fecha y texto. Acá es JSX y el escape es
// automático.
interface Props {
    comentario: Comentario;
    onEliminar: (id: number) => void;
}

function TarjetaComentario({ comentario, onEliminar }: Props) {
    return (
        <div className="comentario">
            <div className="comentario-info">
                <strong>{comentario.autor}</strong>
                <span className="comentario-fecha">{comentario.creado_en}</span>
            </div>
            <p className="comentario-texto">{comentario.texto}</p>
            <button
                type="button"
                className="icon-btn comentario-borrar"
                aria-label="Eliminar comentario"
                title="Eliminar"
                onClick={() => onEliminar(comentario.id)}
            >
                <IconoEliminar />
            </button>
        </div>
    );
}

export default TarjetaComentario;