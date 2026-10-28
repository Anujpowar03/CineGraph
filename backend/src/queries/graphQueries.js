/**
 * Cypher for the interactive graph explorer.
 * Queries return raw nodes and relationships; graphService converts them to
 * Cytoscape elements and strips private properties (e.g. user e-mail).
 */

/**
 * A movie's neighbourhood:
 *  1. its genres, actors and directors (1 hop);
 *  2. the strongest related movies reachable through those nodes (2 hops),
 *     ranked so shared people outweigh shared genres;
 *  3. a few users who liked or rated the movie.
 */
export const MOVIE_GRAPH = `
  MATCH (m:Movie {movieId: $movieId})
  OPTIONAL MATCH (m)-[r1:IN_GENRE|ACTED_IN|DIRECTED]-(attr)
  WITH m, collect(DISTINCT attr) AS attrs, collect(DISTINCT r1) AS attrRels
  OPTIONAL MATCH (m)-[:IN_GENRE|ACTED_IN|DIRECTED]-(s)-[:IN_GENRE|ACTED_IN|DIRECTED]-(o:Movie)
  WHERE o <> m
  WITH m, attrs, attrRels, o,
       sum(CASE WHEN s:Genre THEN 1 ELSE 3 END) AS strength
  ORDER BY strength DESC, o.rating DESC
  WITH m, attrs, attrRels, collect(o)[0..$relatedLimit] AS related
  // edges that connect each related movie back to the shared genre/person nodes
  UNWIND CASE WHEN size(related) = 0 THEN [null] ELSE related END AS o2
  OPTIONAL MATCH (o2)-[r2:IN_GENRE|ACTED_IN|DIRECTED]-(a)
  WHERE a IN attrs
  WITH m, attrs, attrRels, related, collect(DISTINCT r2) AS relatedRels
  OPTIONAL MATCH (u:User)-[r3:LIKED|RATED]->(m)
  WITH m, attrs, attrRels, related, relatedRels, u, collect(r3) AS userRels
  ORDER BY size(userRels) DESC, u.name ASC
  WITH m, attrs, attrRels, related, relatedRels,
       collect(CASE WHEN u IS NOT NULL THEN {user: u, rels: userRels} END)[0..$userLimit] AS users
  RETURN [m] + attrs + related + [x IN users | x.user] AS nodes,
         attrRels + relatedRels + reduce(acc = [], x IN users | acc + x.rels) AS relationships
`;

/**
 * Generic one-hop expansion around any node. The label and id property come
 * from a whitelist in graphService - they are never taken raw from the request.
 * $offset/$limit page through large neighbourhoods ("load more connections").
 */
export function neighbourhoodQuery(label, idProperty, relationshipTypes) {
  return `
    MATCH (n:${label} {${idProperty}: $id})
    OPTIONAL MATCH (n)-[r:${relationshipTypes.join('|')}]-(nb)
    WITH n, r, nb
    ORDER BY coalesce(nb.rating, 0) DESC, coalesce(nb.title, nb.name) ASC
    WITH n, collect(CASE WHEN r IS NOT NULL THEN {rel: r, node: nb} END) AS pairs
    RETURN n AS center,
           size(pairs) AS total,
           [x IN pairs[$offset..($offset + $limit)] | x.node] AS nodes,
           [x IN pairs[$offset..($offset + $limit)] | x.rel] AS relationships
  `;
}
