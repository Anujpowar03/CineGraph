import { defineConfig } from 'vitest/config';

// Integration tests run against the Neo4j database configured in backend/.env.
// WARNING: they (re)seed that database. Use a local/dev database, not production.
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.js'],
    environment: 'node',
    globalSetup: ['tests/integration/globalSetup.js'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'integration-test-secret-that-is-at-least-32-characters',
      CLIENT_URL: 'http://localhost:5173',
    },
  },
});
