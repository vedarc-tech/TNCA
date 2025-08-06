import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    chunkSizeWarningLimit: 1000, // Increase warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-icons', 'framer-motion'],
          charts: ['recharts'],
          forms: ['react-hook-form', 'react-select', 'react-dropzone'],
          utils: ['axios', 'date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
}) 