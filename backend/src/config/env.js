import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const toList = (value, fallback) =>
  (value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: Number.parseInt(process.env.PORT || '5000', 10),
  clientUrls: toList(process.env.CLIENT_URL, 'http://localhost:5173'),
  neo4j: {
    uri: process.env.NEO4J_URI || 'neo4j://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || '',
    database: process.env.NEO4J_DATABASE || 'neo4j',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    name: 'cinegraph_token',
    sameSite: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(),
  },
  tmdb: {
    readAccessToken: process.env.TMDB_READ_ACCESS_TOKEN || '',
  },
};

const PLACEHOLDER_SECRET = 'replace-with-a-long-random-secret-at-least-32-characters';

/**
 * Validates settings the HTTP server cannot run safely without.
 * Called once at start-up so misconfiguration fails fast with a clear message.
 */
export function assertServerConfig() {
  const problems = [];
  if (!env.jwt.secret || env.jwt.secret.length < 32) {
    problems.push('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  if (env.isProduction && env.jwt.secret === PLACEHOLDER_SECRET) {
    problems.push('JWT_SECRET still contains the placeholder value from .env.example.');
  }
  if (!['lax', 'strict', 'none'].includes(env.cookie.sameSite)) {
    problems.push('COOKIE_SAMESITE must be one of: lax, strict, none.');
  }
  if (problems.length > 0) {
    throw new Error(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
  }
}
