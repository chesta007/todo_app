import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import App from './App.tsx'

// main.tsx — EL PUNTO DE ENTRADA (lo que Leo mostró en clase)
// ------------------------------------------------------------
// 1. createRoot agarra el <div id="root"> del index.html
// 2. .render() construye TODA la aplicación adentro, desde JavaScript
// 3. BrowserRouter = el "react-router": las rutas (/ y /tareas/:id)
//    se definen en App.tsx — "no existen carpetas físicas, son rutas"
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)