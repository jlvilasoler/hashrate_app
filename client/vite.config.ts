import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // evita el aviso de chunks > 500 KB (React, jspdf, etc.)
  },
  server: {
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true }
    }
  }
})
