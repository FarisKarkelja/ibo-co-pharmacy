import { defineConfig } from 'vitest/config';

// Tests run against a separate database (ibo_co_pharmacy_test) that is
// created and migrated automatically, so your dev data is never touched.
export const testEnv = {
  NODE_ENV: 'test',
  DB_NAME: process.env.TEST_DB_NAME ?? 'ibo_co_pharmacy_test',
  JWT_SECRET: 'test-secret-that-is-long-enough',
};

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './tests/global-setup.ts',
    env: testEnv,
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
  },
});
