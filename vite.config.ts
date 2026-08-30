import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

function normalizeBasePath(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: true,
  },
});
