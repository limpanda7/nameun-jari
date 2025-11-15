import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/forest-api': {
        target: 'https://forest100.herokuapp.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/forest-api/, '/api')
      },
      '/api/telegram-webhook': {
        target: 'https://asia-northeast3-nameun-jari.cloudfunctions.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/telegram-webhook/, '/telegramWebhook')
      }
    }
  }
})
