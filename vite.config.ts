import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Kutubxonalarni alohida chunk'larga ajratamiz: ular kamdan-kam
        // o'zgaradi, shuning uchun brauzer keshida uzoq turadi.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]recharts|d3-/.test(id)) return 'charts'
          if (/[\\/]@tanstack[\\/]/.test(id)) return 'query'
          if (/[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id))
            return 'react'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
