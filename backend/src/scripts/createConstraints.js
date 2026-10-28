import { pathToFileURL } from 'node:url';
import { closeDriver, describeConnectionError, runSchemaStatement, verifyConnection } from '../config/neo4j.js';
import { CONSTRAINTS, INDEXES } from '../queries/schemaQueries.js';

/** Creates every uniqueness constraint and index. Safe to run repeatedly. */
export async function createConstraints({ log = console.log } = {}) {
  let created = 0;
  for (const statement of [...CONSTRAINTS, ...INDEXES]) {
    const counters = await runSchemaStatement(statement);
    created += (counters.constraintsAdded || 0) + (counters.indexesAdded || 0);
  }
  log(`  ✓ ${CONSTRAINTS.length} constraints and ${INDEXES.length} indexes ensured (${created} newly created)`);
  return { constraints: CONSTRAINTS.length, indexes: INDEXES.length, created };
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  try {
    await verifyConnection();
    console.log('Creating Neo4j constraints and indexes...');
    await createConstraints();
  } catch (error) {
    console.error(`✗ ${describeConnectionError(error)}`);
    process.exitCode = 1;
  } finally {
    await closeDriver();
  }
}
