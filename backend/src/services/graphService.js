import * as graphs from '../repositories/graphRepository.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Converts Neo4j nodes/relationships into Cytoscape.js elements.
 *
 * Node ids are stable and readable ("movie:inception-2010") so the browser can
 * merge newly expanded neighbourhoods into the existing graph without
 * duplicates. Only whitelisted properties are exposed for each label - a User
 * node never carries its e-mail address or password hash.
 */
export const NODE_TYPES = {
  movie: {
    label: 'Movie',
    idProperty: 'movieId',
    relationshipTypes: ['IN_GENRE', 'ACTED_IN', 'DIRECTED', 'LIKED', 'RATED'],
    publicProps: ['movieId', 'title', 'releaseYear', 'rating', 'runtime', 'posterPath'],
    caption: (p) => p.title,
  },
  genre: {
    label: 'Genre',
    idProperty: 'genreId',
    relationshipTypes: ['IN_GENRE'],
    publicProps: ['genreId', 'name'],
    caption: (p) => p.name,
  },
  actor: {
    label: 'Actor',
    idProperty: 'actorId',
    relationshipTypes: ['ACTED_IN'],
    publicProps: ['actorId', 'name'],
    caption: (p) => p.name,
  },
  director: {
    label: 'Director',
    idProperty: 'directorId',
    relationshipTypes: ['DIRECTED'],
    publicProps: ['directorId', 'name'],
    caption: (p) => p.name,
  },
  user: {
    label: 'User',
    idProperty: 'userId',
    relationshipTypes: ['LIKED', 'RATED', 'WATCHED', 'PREFERS'],
    publicProps: ['userId', 'name'],
    caption: (p) => p.name,
  },
};

const LABEL_TO_TYPE = Object.fromEntries(Object.entries(NODE_TYPES).map(([type, def]) => [def.label, type]));

/** "Priya Nair" -> "Priya N." for users other than the viewer. */
const shortName = (name = '') => {
  const [first, ...rest] = name.trim().split(/\s+/);
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

function toCyNode(node, viewerId) {
  const type = node.labels.map((l) => LABEL_TO_TYPE[l]).find(Boolean);
  if (!type) return null;
  const def = NODE_TYPES[type];
  const props = Object.fromEntries(
    def.publicProps.filter((k) => node.properties[k] !== undefined).map((k) => [k, node.properties[k]]),
  );
  const entityId = node.properties[def.idProperty];
  const isViewer = type === 'user' && entityId === viewerId;
  if (type === 'user' && !isViewer) props.name = shortName(props.name);
  return {
    elementId: node.elementId,
    element: {
      data: {
        id: `${type}:${entityId}`,
        type,
        entityId,
        label: isViewer ? 'You' : def.caption(props),
        isViewer,
        ...props,
      },
    },
  };
}

function buildElements(nodes, relationships, viewerId) {
  const byElementId = new Map();
  for (const node of nodes) {
    if (!node || byElementId.has(node.elementId)) continue;
    const converted = toCyNode(node, viewerId);
    if (converted) byElementId.set(node.elementId, converted.element);
  }
  const edges = new Map();
  for (const rel of relationships) {
    if (!rel) continue;
    const source = byElementId.get(rel.startNodeElementId);
    const target = byElementId.get(rel.endNodeElementId);
    if (!source || !target) continue; // only draw edges between nodes we return
    const id = `${source.data.id}|${rel.type}|${target.data.id}`;
    const data = { id, source: source.data.id, target: target.data.id, label: rel.type };
    if (rel.type === 'RATED') data.rating = rel.properties.rating;
    edges.set(id, { data });
  }
  return { nodes: [...byElementId.values()], edges: [...edges.values()] };
}

export async function getMovieGraph(movieId, { relatedLimit, userLimit, viewerId }) {
  const row = await graphs.getMovieGraph(movieId, { relatedLimit, userLimit });
  if (!row) throw ApiError.notFound(`Movie "${movieId}" not found`);
  const elements = buildElements(row.nodes, row.relationships, viewerId);
  return { center: `movie:${movieId}`, ...elements };
}

export async function getNeighbourhood(type, id, { offset, limit, viewerId }) {
  const def = NODE_TYPES[type];
  if (!def) throw ApiError.badRequest(`Unknown node type "${type}"`);
  // A user's full interaction history is private: only the owner may expand it.
  if (type === 'user') {
    if (!viewerId) throw ApiError.unauthorized('Sign in to explore your own graph');
    if (id !== viewerId && id !== 'me') throw ApiError.forbidden('You can only expand your own user node');
    id = viewerId;
  }
  const row = await graphs.getNeighbourhood(def, id, { offset, limit });
  if (!row) throw ApiError.notFound(`${def.label} "${id}" not found`);
  const elements = buildElements([row.center, ...row.nodes], row.relationships, viewerId);
  const returned = row.nodes.length;
  return {
    center: `${type}:${id}`,
    ...elements,
    page: { offset, limit, returned, total: row.total, hasMore: offset + returned < row.total },
  };
}
