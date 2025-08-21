// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// განსაზღვრულია GitHub Pages-ზე სწორად გამოქვეყნებისათვის
export default defineConfig({
  plugins: [react()],
  base: '/navito-ai/',   // აქ შენი GitHub repo-ს სახელი წერია (navito-ai)
  build: {
    outDir: 'dist'
  }
})
