import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Estatus, Filtros } from '../tipos'

// Buscador — los filtros por nombre, responsable y estatus
// ------------------------------------------------------------
// En vanilla: #form-filtro con .value de cada caja + URLSearchParams
// en model.js. En React: componente controlado que arma el objeto
// Filtros y se lo pasa a la página (que lo manda al backend).
// Mismo detalle que en el vanilla: el estatus arranca en "Pendiente"
// (para no traer TODAS las tareas al abrir).
interface Props {
    onFiltrar: (filtros: Filtros) => void;
}

function Buscador({ onFiltrar }: Props) {
    const [nombre, setNombre] = useState('');
    const [responsable, setResponsable] = useState('');
    const [estatus, setEstatus] = useState<Estatus | ''>('pendiente');

    function enviar(event: FormEvent) {
        event.preventDefault(); // sin recarga de página
        onFiltrar({
            nombre: nombre.trim() || undefined,
            responsable: responsable.trim() || undefined,
            estatus: estatus || undefined,
        });
    }

    function limpiar() {
        // "Limpiar" vuelve al estado inicial (estatus = Pendiente)
        setNombre('');
        setResponsable('');
        setEstatus('pendiente');
        onFiltrar({ estatus: 'pendiente' });
    }

    return (
        <div className="card search-card">
            <h2 className="card-title">Buscar tareas</h2>
            <form onSubmit={enviar}>
                <div className="search-grid">
                    <div className="field">
                        <label htmlFor="filtro-nombre">Por nombre</label>
                        <input
                            type="text"
                            id="filtro-nombre"
                            placeholder="Ej. presupuesto"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="filtro-responsable">Por responsable</label>
                        <input
                            type="text"
                            id="filtro-responsable"
                            placeholder="Ej. Ana"
                            value={responsable}
                            onChange={(e) => setResponsable(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="filtro-estatus">Por estatus</label>
                        <select id="filtro-estatus" value={estatus} onChange={(e) => setEstatus(e.target.value as Estatus | '')}>
                            <option value="">Todas</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_progreso">En progreso</option>
                            <option value="hecha">Hecha</option>
                        </select>
                    </div>
                </div>
                <div className="search-actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                        Filtrar
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={limpiar}>
                        Limpiar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Buscador;