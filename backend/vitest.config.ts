import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false, // Run integration tests sequentially against database
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
