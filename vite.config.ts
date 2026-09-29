/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base` нужен для GitHub Pages: сайт живёт по адресу /<repo>/, а не в корне.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/green-api-chat/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
