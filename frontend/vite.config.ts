import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    devSourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        // Inside Docker Compose the backend is reachable via its service DNS
        // name. Outside Compose (e.g. running `npm run dev` directly on the
        // host) override with VITE_API_PROXY_TARGET=http://localhost:8080.
        target: process.env.VITE_API_PROXY_TARGET || 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
})
