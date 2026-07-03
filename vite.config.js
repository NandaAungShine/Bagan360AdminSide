import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,
    strictPort: true,

    proxy: {
      // ၁။ Login (Auth) အတွက် အထူးသတ်မှတ်ချက်
      // Frontend က /api/auth/login ဆိုပြီး ခေါ်တာကို
      // Backend က /auth/login ဆီ ပြန်ညွှန်းပေးမယ်
      '/api/auth': {
        target: 'http://130.94.21.185:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },

      // ၂။ ကျန်တဲ့ API အကုန်လုံး (Dashboard, Users, စသဖြင့်)
      // Frontend က /api/... ဆိုပြီး ခေါ်သလိုပဲ Backend ကို /api/... အတိုင်း ပို့ပေးမယ်
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