import { createApp } from './app.js';
import { assertServerConfig, env } from './config/env.js';
import { closeDriver, describeConnectionError, verifyConnection } from './config/neo4j.js';

async function start() {
  assertServerConfig();

  try {
    const server = await verifyConnection();
    console.log(`✓ Connected to ${server.agent} at ${server.address} (database "${env.neo4j.database}")`);
  } catch (error) {
    // Keep running: /api/health reports the problem and requests return 503
    // until the database becomes reachable.
    console.warn(`⚠ Neo4j is not reachable yet: ${describeConnectionError(error)}`);
  }

  const app = createApp();
  const httpServer = app.listen(env.port, () => {
    console.log(`✓ CineGraph API listening on http://localhost:${env.port}/api`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received - shutting down gracefully...`);
    httpServer.close(async () => {
      await closeDriver();
      console.log('✓ HTTP server and Neo4j driver closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error(`✗ Failed to start CineGraph API:\n${error.message}`);
  process.exit(1);
});
