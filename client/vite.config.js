import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': process.env.VITE_API_URL || 'http://localhost:5000', 
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: ['socket.io-client'],
  },
})
