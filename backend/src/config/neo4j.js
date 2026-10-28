import neo4j from 'neo4j-driver';
import { env } from './env.js';
import { toNeo4jParams, toPlain } from '../utils/neo4jTransform.js';

/**
 * A single Driver instance is shared by the whole application. The driver owns
 * a connection pool; sessions are cheap, short-lived and must always be closed.
 */
let driver = null;

export function getDriver() {
  if (driver) return driver;

  const { uri, username, password } = env.neo4j;
  if (!uri) throw new Error('NEO4J_URI is not set. Copy backend/.env.example to backend/.env.');

  driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    // Return plain JS numbers for integers. Safe here: all counts and ids are small.
    disableLosslessIntegers: true,
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 10_000,
    connectionTimeout: 10_000,
    maxTransactionRetryTime: 10_000,
  });
  return driver;
}

/** Checks that the database is reachable and the credentials are valid. */
export async function verifyConnection() {
  const info = await getDriver().getServerInfo({ database: env.neo4j.database });
  return { address: info.address, agent: info.agent, protocolVersion: info.protocolVersion };
}

/** Human-readable hint for the most common connection problems. */
export function describeConnectionError(error) {
  const code = error?.code || '';
  if (code === 'Neo.ClientError.Security.Unauthorized') {
    return 'Neo4j rejected the username/password. Check NEO4J_USERNAME and NEO4J_PASSWORD in backend/.env.';
  }
  if (code === 'ServiceUnavailable' || code === 'SessionExpired') {
    return `Could not reach Neo4j at ${env.neo4j.uri}. Is the database running? ` +
      'AuraDB needs the neo4j+s:// scheme; a local server usually uses neo4j://localhost:7687.';
  }
  if (code === 'Neo.ClientError.Database.DatabaseNotFound') {
    return `Database "${env.neo4j.database}" does not exist. Community Edition only supports "neo4j".`;
  }
  return error?.message || 'Unknown Neo4j error';
}

function openSession(accessMode) {
  return getDriver().session({ database: env.neo4j.database, defaultAccessMode: accessMode });
}

/**
 * Runs a read query inside a managed transaction (automatically retried on
 * transient errors) and returns the records as plain objects.
 */
export async function readQuery(cypher, params = {}) {
  const session = openSession(neo4j.session.READ);
  try {
    const result = await session.executeRead((tx) => tx.run(cypher, toNeo4jParams(params)));
    return result.records.map((record) => toPlain(record.toObject()));
  } finally {
    await session.close();
  }
}

/** Same as readQuery but for statements that change the graph. */
export async function writeQuery(cypher, params = {}) {
  const session = openSession(neo4j.session.WRITE);
  try {
    const result = await session.executeWrite((tx) => tx.run(cypher, toNeo4jParams(params)));
    return result.records.map((record) => toPlain(record.toObject()));
  } finally {
    await session.close();
  }
}

/**
 * Write query that also returns the summary counters (nodes/relationships
 * created). Used by the seed script to report what changed.
 */
export async function writeQueryWithSummary(cypher, params = {}) {
  const session = openSession(neo4j.session.WRITE);
  try {
    const result = await session.executeWrite((tx) => tx.run(cypher, toNeo4jParams(params)));
    return {
      records: result.records.map((record) => toPlain(record.toObject())),
      counters: result.summary.counters.updates(),
    };
  } finally {
    await session.close();
  }
}

/** Schema statements (constraints/indexes) must run in auto-commit transactions. */
export async function runSchemaStatement(cypher) {
  const session = openSession(neo4j.session.WRITE);
  try {
    const result = await session.run(cypher);
    return result.summary.counters.updates();
  } finally {
    await session.close();
  }
}

export async function closeDriver() {
  if (driver) {
    const current = driver;
    driver = null;
    await current.close();
  }
}
