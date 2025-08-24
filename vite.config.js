import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://nameun-jari-cph86m5r6-sunghoon-lims-projects.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
