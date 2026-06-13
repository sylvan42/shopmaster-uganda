import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honour the PORT env var (used by preview tooling); fall back to Vite's default
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
