import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,
    strictPort: true,

    proxy: {
      '/auth': {
        target: 'http://130.94.21.185:8000',
        changeOrigin: true,
        secure: false,
      },

      '/api': {
        target: 'http://130.94.21.185:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});