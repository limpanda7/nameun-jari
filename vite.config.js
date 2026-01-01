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
      },
      '/api/onOffReservation': {
        target: 'https://asia-northeast3-nameun-jari.cloudfunctions.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/onOffReservation/, '/onOffReservation')
      },
      '/api/confirm-reservation': {
        target: 'https://asia-northeast3-nameun-jari.cloudfunctions.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/confirm-reservation/, '/confirmReservation')
      },
      '/api/kakaopay': {
        target: process.env.NODE_ENV === 'development' 
          ? 'http://127.0.0.1:5001'
          : 'https://asia-northeast3-nameun-jari.cloudfunctions.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          if (process.env.NODE_ENV === 'development') {
            // 로컬 개발
            if (path.includes('/approve')) {
              return path.replace(/^\/api\/kakaopay\/approve/, '/nameun-jari/us-central1/kakaoPayApprove');
            }
            return path.replace(/^\/api\/kakaopay\/ready/, '/nameun-jari/us-central1/kakaoPayReady');
          } else {
            // 프로덕션
            if (path.includes('/approve')) {
              return path.replace(/^\/api\/kakaopay\/approve/, '/kakaoPayApprove');
            }
            return path.replace(/^\/api\/kakaopay\/ready/, '/kakaoPayReady');
          }
        }
      }
    }
  }
})
