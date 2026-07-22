import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,
    strictPort: true,

    proxy: {
      '/api/auth': {
        target: 'http://130.94.21.185:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },

      
      '/api': {
        target: 'http://130.94.21.185:8000',
        changeOrigin: true,
        secure: false,
        // ဒီမှာ rewrite မထည့်ပါနဲ့။ မူရင်းအတိုင်းထားပါ။
      },

      // ၃။ (Optional) တစ်ခြားနေရာက /auth ကို တိုက်ရိုက်ခေါ်ရင် အတွက် ထားထားတာ
      '/auth': {
        target: 'http://130.94.21.185:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});