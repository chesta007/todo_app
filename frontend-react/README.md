# Pizarra — frontend en React (clase 15)

La app ToDo de capacitación convertida de HTML/CSS/JS vanilla a **React + TypeScript + Vite**.
El backend (Express) no cambió: vive en `../backend` y responde en `http://localhost:3000`.

## Cómo correrla

```bash
# 1. Backend (desde ../backend)
npm start          # API en http://localhost:3000

# 2. Este frontend
npm install        # primera vez
npm run dev        # app en http://localhost:5173
```

El proxy de Vite (`vite.config.ts`) manda `/api` → `http://localhost:3000`, así el fetch
usa la misma URL relativa que tendría en producción.

## Estructura

```
src/
├── main.tsx                 → punto de entrada (createRoot + BrowserRouter)
├── App.tsx                  → las rutas: / · /tareas/:id · * (SPA)
├── api.ts                   → el "model": fetch al backend (igual que model.js)
├── tipos.ts                 → los tipos (contrato de Tarea/Comentario/Estatus)
├── styles.css               → copia exacta de styles.css del frontend vanilla
├── componentes/             → TarjetaTarea, ChipEstatus, FormularioTarea, Buscador,
│                              MensajeError, TarjetaComentario, Iconos
└── paginas/                 → PaginaLista, PaginaDetalle, PaginaNoEncontrada
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | servidor de desarrollo con hot reload (http://localhost:5173) |
| `npm run build` | TypeScript + build de producción en `dist/` |
| `npm run lint` | oxlint (0 warnings esperados) |
| `npm run preview` | sirve el build de producción localmente |

Comparación completa vanilla ↔ React: `../COMPARACION_VANILLA_REACT.md`.