import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    css: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false // Disable sourcemaps in production for security
  }
});