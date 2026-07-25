import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Output langsung ke backend/static agar FastAPI bisa serve frontend
    outDir: 'backend/static',
    emptyOutDir: true,
    // Suppress chunk size warning (bundle ~600KB is acceptable for this app)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Pisahkan vendor besar ke chunk terpisah agar caching lebih efisien
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-accordion'],
        },
      },
    },
  },
})
