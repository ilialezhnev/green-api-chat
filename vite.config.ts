/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base` is needed for GitHub Pages: the site is served from /<repo>/, not from the root.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/green-api-chat/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
