import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Detect if running in Tauri environment
const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base URL - empty for Tauri (loads from local file system)
  base: isTauri ? '' : '/',
  // Build configuration
  build: {
    // Tauri expects the output in dist/
    outDir: 'dist',
    // Generate sourcemaps for debugging
    sourcemap: !isTauri,
  },
  // Dev server configuration
  server: {
    // Tauri expects fixed port for hot reload
    port: 5173,
    strictPort: true,
    // Allow connections from Tauri
    host: isTauri ? '127.0.0.1' : true,
  },
})
