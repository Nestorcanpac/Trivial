import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// IMPORTANT: Change '/trivial/' to match your GitHub repository name
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/trivial/',
})
