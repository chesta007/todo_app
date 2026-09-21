import { useState } from 'react'
import type { FormEvent } from 'react'
import type { DatosTarea, Tarea } from '../tipos'

// FormularioTarea — crear y editar (era #form-tarea en el vanilla)
// ------------------------------------------------------------
// En vanilla: el controller leía los valores con
//   document.getElementById('input-nombre').value
// y volcaba una tarea al formulario con view.volcarEnFormulario().
// En React: los inputs son CONTROLADOS — el estado `valores` es la
// fuente de verdad y cada tecla pasa por setValores. No existe
// querySelector: el form ya sabe qué hay en cada caja.
interface Props {
    editando: Tarea | null; // null = creando · una tarea = editándola
    enviando: boolean;      // true mientras el backend responde (anti doble-click)
    onGuardar: (datos: DatosTarea) => void;
    onCancelar: () => void;
}

// Los valores con los que arranca el formulario (estatus = pendiente)
function valoresIniciales(): DatosTarea {
    return { nombre: '', responsable: '', estatus: 'pendiente', descripcion: '' };
}

function FormularioTarea({ editando, enviando, onGuardar, onCancelar }: Props) {
    // El estado arranca con la tarea a editar (o vacío si es nueva).
    // No hay useEffect para "volcar la tarea al form": la página le
    // cambia la KEY cuando cambia el modo (crear ↔ editar), y al cambiar
    // la key React RECREA el componente desde cero con este estado inicial.
    const [valores, setValores] = useState<DatosTarea>(() =>
        editando
            ? {
                  nombre: editando.nombre,
                  responsable: editando.responsable,
                  estatus: editando.estatus,
                  descripcion: editando.descripcion || '',
              }
            : valoresIniciales(),
    );

    function cambiar(campo: keyof DatosTarea, valor: string) {
        setValores((prev) => ({ ...prev, [campo]: valor }));
    }

    function enviar(event: FormEvent) {
        event.preventDefault(); // igual que en vanilla: sin recarga de página
        onGuardar({
            nombre: valores.nombre.trim(),
            responsable: valores.responsable.trim(),
            estatus: valores.estatus,
            descripcion: valores.descripcion.trim(),
        });
    }

    const botonTexto = enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar tarea';

    return (
        <section className="card form-card">
            <h2 className="card-title">{editando ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <form onSubmit={enviar}>
                <div className="field">
                    <label htmlFor="input-nombre">Nombre</label>
                    <input
                        type="text"
                        id="input-nombre"
                        placeholder="Qué hay que hacer"
                        required
                        value={valores.nombre}
                        onChange={(e) => cambiar('nombre', e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="input-responsable">Responsable</label>
                    <input
                        type="text"
                        id="input-responsable"
                        placeholder="Quién la toma"
                        required
                        value={valores.responsable}
                        onChange={(e) => cambiar('responsable', e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="select-estatus">Estatus</label>
                    <select
                        id="select-estatus"
                        value={valores.estatus}
                        onChange={(e) => cambiar('estatus', e.target.value)}
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En progreso</option>
                        <option value="hecha">Hecha</option>
                    </select>
                </div>

                <div className="field">
                    <label htmlFor="input-descripcion">Descripción</label>
                    <textarea
                        id="input-descripcion"
                        rows={3}
                        placeholder="Detalle, criterio de listo, notas"
                        value={valores.descripcion}
                        onChange={(e) => cambiar('descripcion', e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={enviando}>
                    {botonTexto}
                </button>
                {editando && (
                    <button type="button" className="btn btn-ghost" onClick={onCancelar}>
                        Cancelar edición
                    </button>
                )}
            </form>
        </section>
    );
}

export default FormularioTarea;