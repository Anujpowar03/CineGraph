import { defineConfig } from 'vitest/config';

// Unit + API-contract tests. They never touch a real database:
// the Neo4j module is mocked where needed.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'unit-test-secret-that-is-at-least-32-characters-long',
      CLIENT_URL: 'http://localhost:5173',
    },
  },
});
