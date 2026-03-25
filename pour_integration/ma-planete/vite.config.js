import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Met toutes les libs three dans un chunk
            if (id.includes('node_modules/three') ||
              id.includes('@react-three/fiber') ||
              id.includes('@react-three/drei')) {
              return 'three'
              }
              // Met turf dans un chunk séparé
              if (id.includes('@turf/turf')) {
                return 'turf'
              }
              // Met React et ses dépendances dans un chunk vendor
              if (id.includes('node_modules/react') ||
                id.includes('node_modules/react-dom') ||
                id.includes('react-h5-audio-player')) {
                return 'vendor'
                }
          }
        }
      }
    }
})
