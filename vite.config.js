// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://130.94.21.185:8000',  // Updated to correct IP
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://130.94.21.185:8000',  // Updated to correct IP
        changeOrigin: true,
        secure: false,
      }
    }
  }
})