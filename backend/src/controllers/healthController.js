import { env } from '../config/env.js';
import { verifyConnection } from '../config/neo4j.js';

/** Reports API status and whether Neo4j is reachable (503 when it is not). */
export async function health(req, res) {
  try {
    const server = await verifyConnection();
    res.json({
      success: true,
      data: { status: 'ok', database: 'connected', neo4j: server.agent, databaseName: env.neo4j.database },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: { code: 'DATABASE_UNAVAILABLE', message: 'API is running but Neo4j is unreachable' },
      data: { status: 'degraded', database: 'unavailable' },
    });
  }
}
