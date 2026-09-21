import { Link } from 'react-router-dom'

// PaginaNoEncontrada — la ruta "*" (cualquier URL que no existe)
// ------------------------------------------------------------
// En el vanilla no había página 404 en el front (el backend respondía
// "Ruta no encontrada"). Con rutas en React, el catch-all "*" muestra
// un aviso para cualquier URL desconocida.
function PaginaNoEncontrada() {
    return (
        <div className="page">
            <header className="header">
                <div className="header-brand">
                    <p className="kicker">Taller de tareas</p>
                    <h1 className="wordmark">Pizarra</h1>
                </div>
            </header>
            <main className="layout-detalle">
                <section className="card detalle-card">
                    <h2 className="card-title">Ruta no encontrada</h2>
                    <p className="detalle-descripcion">Esa dirección no existe en la pizarra.</p>
                    <p style={{ marginTop: '16px' }}>
                        <Link className="back" to="/">
                            ← Volver a la pizarra
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    );
}

export default PaginaNoEncontrada;