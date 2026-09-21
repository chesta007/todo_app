import { ESTADOS } from '../tipos'
import type { Estatus } from '../tipos'

// ChipEstatus — el selector de estatus de cada tarjeta de la lista
// ------------------------------------------------------------
// En vanilla: un <select> pintado con innerHTML + opcionesEstatus()
// y el controller escuchaba el evento 'change' con delegación.
// En React: un componente controlado — el valor viene de la prop
// `estatus` y al cambiar se llama a `onCambio` (el estado lo decide
// la página, no el DOM).
interface Props {
    estatus: Estatus;
    id: number;
    onCambio: (id: number, estatus: Estatus) => void;
}

function ChipEstatus({ estatus, id, onCambio }: Props) {
    return (
        <span className="chip-wrap">
            <select
                className={`chip estatus-${estatus}`}
                value={estatus}
                aria-label="Cambiar estatus"
                onChange={(e) => onCambio(id, e.target.value as Estatus)}
            >
                {(Object.keys(ESTADOS) as Estatus[]).map((valor) => (
                    <option key={valor} value={valor}>
                        {ESTADOS[valor]}
                    </option>
                ))}
            </select>
        </span>
    );
}

export default ChipEstatus;