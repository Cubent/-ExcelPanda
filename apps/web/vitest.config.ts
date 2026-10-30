import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Next's tsconfig sets jsx: "preserve", which Vite would leave untransformed.
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: { include: ['**/*.test.{ts,tsx}'], exclude: ['node_modules/**', '.next/**'] },
});
