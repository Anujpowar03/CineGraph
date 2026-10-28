import { closeDriver, describeConnectionError, verifyConnection, writeQuery } from '../../src/config/neo4j.js';
import { seedDatabase } from '../../src/scripts/seedDatabase.js';

/**
 * Runs once before the integration suite: checks connectivity and seeds the
 * sample graph. Afterwards, removes any accounts created by the tests.
 */
export async function setup() {
  process.env.NODE_ENV = 'test';
  try {
    await verifyConnection();
  } catch (error) {
    throw new Error(`Integration tests need a running Neo4j (see backend/.env): ${describeConnectionError(error)}`);
  }
  await seedDatabase({ log: () => {} });
  await closeDriver();
}

export async function teardown() {
  await writeQuery("MATCH (u:User) WHERE u.email ENDS WITH '@test.cinegraph' DETACH DELETE u");
  await closeDriver();
}
