import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2020',
    lib: {
      entry: 'src/fm-mock.ts',
      name: 'FMMock',
      formats: ['es', 'umd'],
      // Pinned to match the historical artifact names referenced by the
      // package `exports` map, the README, and example/index.html.
      fileName: (format) => (format === 'es' ? 'fm-mock.mjs' : 'fm-mock.js'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'html'],
    },
  },
});
