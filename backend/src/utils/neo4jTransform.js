import neo4j from 'neo4j-driver';

/**
 * Neo4j returns its own types (Integer, DateTime, Node, Relationship...).
 * These helpers convert them to plain JSON-friendly JavaScript values.
 */

const isTemporal = (value) =>
  neo4j.isDateTime(value) ||
  neo4j.isDate(value) ||
  neo4j.isLocalDateTime(value) ||
  neo4j.isTime(value) ||
  neo4j.isLocalTime(value) ||
  neo4j.isDuration(value);

export function toPlain(value) {
  if (value === null || value === undefined) return value ?? null;
  if (neo4j.isInt(value)) return value.inSafeRange() ? value.toNumber() : value.toString();
  if (isTemporal(value)) {
    // DateTime -> ISO-8601 string (e.g. 2026-01-05T10:00:00Z)
    if (neo4j.isDateTime(value)) return new Date(value.toString()).toISOString();
    return value.toString();
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (value instanceof neo4j.types.Node) {
    return {
      elementId: value.elementId,
      labels: value.labels,
      properties: toPlain(value.properties),
    };
  }
  if (value instanceof neo4j.types.Relationship) {
    return {
      elementId: value.elementId,
      type: value.type,
      startNodeElementId: value.startNodeElementId,
      endNodeElementId: value.endNodeElementId,
      properties: toPlain(value.properties),
    };
  }
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

/**
 * JavaScript has a single number type, so the driver would send 2010 as the
 * float 2010.0. Cypher needs real integers for LIMIT/SKIP and we want years,
 * ratings and runtimes stored as integers, so whole numbers are converted to
 * Neo4j Integers before a query is sent. Use toFloat() in Cypher when a
 * division must produce a fraction.
 */
export function toNeo4jParams(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isInteger(value) ? neo4j.int(value) : value;
  if (Array.isArray(value)) return value.map(toNeo4jParams);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && !neo4j.isInt(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toNeo4jParams(v)]));
  }
  return value;
}
