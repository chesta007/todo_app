import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El frontend (puerto 5173) le habla al backend (puerto 3000)
    // como si fuera el mismo origen: /api/... → http://localhost:3000/api/...
    // (así el fetch no necesita CORS ni cambiar de dominio)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})