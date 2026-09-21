import { Routes, Route } from 'react-router-dom'
import PaginaLista from './paginas/PaginaLista.tsx'
import PaginaDetalle from './paginas/PaginaDetalle.tsx'
import PaginaNoEncontrada from './paginas/PaginaNoEncontrada.tsx'

// App.tsx — LAS RUTAS (el "mapa" de la aplicación)
// ------------------------------------------------------------
// En la versión vanilla había DOS archivos HTML (index.html y tarea.html)
// con `?id=` en la URL. En React no existen páginas separadas: es UNA
// sola página (SPA) y las "páginas" son RUTAS — como los endpoints de
// Express pero del lado del front (lo que explicó Leo: el view también
// tiene rutas).
function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaLista />} />
      <Route path="/tareas/:id" element={<PaginaDetalle />} />
      <Route path="*" element={<PaginaNoEncontrada />} />
    </Routes>
  )
}

export default App