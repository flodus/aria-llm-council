import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/aria-llm-council/',
  plugins: [react()],
                            build: {
                              rollupOptions: {
                                output: {
                                  manualChunks(id) {
                                    // Sépare les grosses bibliothèques (comme react) dans un fichier à part
                                    if (id.includes('node_modules')) {
                                      return 'vendor';
                                    }
                                  }
                                }
                              },
                            chunkSizeWarningLimit: 1000 // Augmente la limite à 1000 ko pour éviter l'avertissement
                            }
})
