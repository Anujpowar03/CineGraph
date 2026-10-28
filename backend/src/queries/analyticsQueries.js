/** Cypher for the analytics dashboard. Every number shown comes from these. */

/** COUNT { pattern } subqueries count matching nodes/relationships (Neo4j 5+). */
export const OVERVIEW = `
  RETURN COUNT { (:Movie) } AS movies,
         COUNT { (:User) } AS users,
         COUNT { (:Genre) } AS genres,
         COUNT { (:Actor) } AS actors,
         COUNT { (:Director) } AS directors,
         COUNT { ()-[:RATED]->() } AS ratings,
         COUNT { ()-[:LIKED]->() } AS likes,
         COUNT { ()-[:WATCHED]->() } AS watches,
         COUNT { ()-[:PREFERS]->() } AS preferences,
         COUNT { ()-[:ACTED_IN]->() } AS actingCredits,
         COUNT { ()-[:DIRECTED]->() } AS directingCredits,
         COUNT { ()-[:IN_GENRE]->() } AS genreLinks
`;

/** Per-genre popularity: catalogue size, likes received and users preferring it. */
export const GENRE_STATS = `
  MATCH (g:Genre)
  OPTIONAL MATCH (g)<-[:IN_GENRE]-(m:Movie)
  WITH g, count(m) AS movieCount, avg(m.rating) AS avgRating
  RETURN g.name AS genre,
         movieCount,
         avgRating,
         COUNT { (g)<-[:IN_GENRE]-(:Movie)<-[:LIKED]-(:User) } AS likes,
         COUNT { (g)<-[:IN_GENRE]-(:Movie)<-[:RATED]-(:User) } AS ratings,
         COUNT { (g)<-[:PREFERS]-(:User) } AS preferredBy
  ORDER BY likes DESC, movieCount DESC, genre ASC
`;

export const TOP_RATED = `
  MATCH (m:Movie)
  RETURN m { .movieId, .title, .releaseYear, .rating, .posterPath } AS movie
  ORDER BY m.rating DESC, m.title ASC
  LIMIT $limit
`;

/** Highest average CineGraph user rating, requiring a minimum number of ratings. */
export const TOP_COMMUNITY_RATED = `
  MATCH (:User)-[r:RATED]->(m:Movie)
  WITH m, avg(r.rating) AS average, count(r) AS ratingCount
  WHERE ratingCount >= $minRatings
  RETURN m { .movieId, .title, .releaseYear, .posterPath } AS movie, average, ratingCount
  ORDER BY average DESC, ratingCount DESC, m.title ASC
  LIMIT $limit
`;

export const RATING_DISTRIBUTION = `
  MATCH (:User)-[r:RATED]->(:Movie)
  RETURN r.rating AS stars, count(*) AS count
  ORDER BY stars
`;

/** People with the most credits - the most connected Actor/Director nodes. */
export const MOST_CONNECTED_PEOPLE = `
  MATCH (p)-[:ACTED_IN|DIRECTED]->(m:Movie)
  WHERE p:Actor OR p:Director
  WITH p, count(DISTINCT m) AS movies
  RETURN p.name AS name, CASE WHEN p:Actor THEN 'Actor' ELSE 'Director' END AS role, movies
  ORDER BY movies DESC, name ASC
  LIMIT $limit
`;

export const MOVIES_PER_DECADE = `
  MATCH (m:Movie)
  WITH (m.releaseYear / 10) * 10 AS decade, count(*) AS movies
  RETURN decade, movies
  ORDER BY decade
`;
