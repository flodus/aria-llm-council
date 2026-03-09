import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Le "base" doit correspondre exactement au nom de ton dépôt GitHub
  base: '/aria-llm-council/',
  plugins: [react()],
                            build: {
                              outDir: 'dist',
                            }
})


