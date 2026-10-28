import { readQuery } from '../config/neo4j.js';
import { MOVIE_GRAPH, neighbourhoodQuery } from '../queries/graphQueries.js';

export async function getMovieGraph(movieId, { relatedLimit, userLimit }) {
  const [row] = await readQuery(MOVIE_GRAPH, { movieId, relatedLimit, userLimit });
  return row ?? null;
}

export async function getNeighbourhood({ label, idProperty, relationshipTypes }, id, { offset, limit }) {
  const [row] = await readQuery(neighbourhoodQuery(label, idProperty, relationshipTypes), { id, offset, limit });
  return row ?? null;
}
