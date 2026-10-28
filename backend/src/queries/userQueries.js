/** Cypher for user accounts, interactions and preferences. */

/** Public fields only - the password hash is never part of this projection. */
export const PUBLIC_USER = 'u { .userId, .name, .email, .createdAt }';

export const CREATE_USER = `
  CREATE (u:User {
    userId: $userId,
    name: $name,
    email: $email,
    passwordHash: $passwordHash,
    createdAt: datetime()
  })
  RETURN ${PUBLIC_USER} AS user
`;

/** Used only by the login flow; the hash never leaves the service layer. */
export const FIND_USER_CREDENTIALS = `
  MATCH (u:User {email: $email})
  RETURN u.userId AS userId, u.passwordHash AS passwordHash
`;

export const FIND_USER_BY_ID = `
  MATCH (u:User {userId: $userId})
  RETURN ${PUBLIC_USER} AS user
`;

export const USER_STATS = `
  MATCH (u:User {userId: $userId})
  RETURN COUNT { (u)-[:LIKED]->(:Movie) } AS likes,
         COUNT { (u)-[:RATED]->(:Movie) } AS ratings,
         COUNT { (u)-[:WATCHED]->(:Movie) } AS watched,
         COUNT { (u)-[:PREFERS]->(:Genre) } AS preferredGenres
`;

// ---------------------------------------------------------------------------
// Interactions. MERGE creates the relationship only if it does not exist yet,
// so a user can never have two LIKED or two RATED relationships to one movie.
// ---------------------------------------------------------------------------

/** Record a like (favourite). ON CREATE keeps the original timestamp on repeats. */
export const LIKE_MOVIE = `
  MATCH (u:User {userId: $userId})
  MATCH (m:Movie {movieId: $movieId})
  MERGE (u)-[l:LIKED]->(m)
  ON CREATE SET l.likedAt = datetime()
  RETURN m.movieId AS movieId, l.likedAt AS likedAt
`;

export const UNLIKE_MOVIE = `
  MATCH (u:User {userId: $userId})-[l:LIKED]->(m:Movie {movieId: $movieId})
  DELETE l
  RETURN count(*) AS removed
`;

/** Record or update a 1-5 star rating. */
export const RATE_MOVIE = `
  MATCH (u:User {userId: $userId})
  MATCH (m:Movie {movieId: $movieId})
  MERGE (u)-[r:RATED]->(m)
  SET r.rating = $rating, r.ratedAt = datetime()
  RETURN m.movieId AS movieId, r.rating AS rating, r.ratedAt AS ratedAt
`;

export const DELETE_RATING = `
  MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie {movieId: $movieId})
  DELETE r
  RETURN count(*) AS removed
`;

/** One WATCHED relationship per user/movie; repeat views update it. */
export const WATCH_MOVIE = `
  MATCH (u:User {userId: $userId})
  MATCH (m:Movie {movieId: $movieId})
  MERGE (u)-[w:WATCHED]->(m)
  ON CREATE SET w.watchCount = 0
  SET w.watchedAt = datetime(), w.watchCount = w.watchCount + 1
  RETURN m.movieId AS movieId, w.watchedAt AS watchedAt, w.watchCount AS watchCount
`;

const USER_MOVIE_CARD = `m {
  .movieId, .title, .releaseYear, .posterPath, .rating, .overview, .runtime,
  genres: [(m)-[:IN_GENRE]->(g:Genre) | g.name]
}`;

export const USER_FAVORITES = `
  MATCH (u:User {userId: $userId})-[l:LIKED]->(m:Movie)
  RETURN ${USER_MOVIE_CARD} AS movie, l.likedAt AS likedAt
  ORDER BY l.likedAt DESC
  LIMIT $limit
`;

export const USER_HISTORY = `
  MATCH (u:User {userId: $userId})-[w:WATCHED]->(m:Movie)
  RETURN ${USER_MOVIE_CARD} AS movie, w.watchedAt AS watchedAt, w.watchCount AS watchCount
  ORDER BY w.watchedAt DESC
  LIMIT $limit
`;

export const USER_RATINGS = `
  MATCH (u:User {userId: $userId})-[r:RATED]->(m:Movie)
  RETURN ${USER_MOVIE_CARD} AS movie, r.rating AS rating, r.ratedAt AS ratedAt
  ORDER BY r.ratedAt DESC
  LIMIT $limit
`;

export const USER_PREFERENCES = `
  MATCH (u:User {userId: $userId})-[:PREFERS]->(g:Genre)
  RETURN g { .genreId, .name } AS genre
  ORDER BY g.name
`;

/** Genres that actually exist - used to validate a preference update. */
export const EXISTING_GENRES = `
  MATCH (g:Genre) WHERE g.genreId IN $genreIds
  RETURN g.genreId AS genreId
`;

/**
 * Replace the user's preferred genres in a single transaction:
 * delete the old PREFERS relationships, then MERGE the new ones.
 */
export const REPLACE_PREFERENCES = `
  MATCH (u:User {userId: $userId})
  OPTIONAL MATCH (u)-[old:PREFERS]->(:Genre)
  WITH u, collect(old) AS oldPreferences
  FOREACH (rel IN oldPreferences | DELETE rel)
  WITH u
  UNWIND $genreIds AS genreId
  MATCH (g:Genre {genreId: genreId})
  MERGE (u)-[p:PREFERS]->(g)
  ON CREATE SET p.createdAt = datetime()
  RETURN count(p) AS saved
`;

/**
 * "Favourite genres" derived from behaviour: genres of movies the user liked or
 * rated 4+ stars, counted per DISTINCT movie so liking AND rating a movie does
 * not count it twice.
 */
export const USER_TOP_GENRES = `
  MATCH (u:User {userId: $userId})-[r:LIKED|RATED]->(m:Movie)
  WHERE type(r) = 'LIKED' OR r.rating >= $minPositiveRating
  WITH DISTINCT m
  MATCH (m)-[:IN_GENRE]->(g:Genre)
  RETURN g.name AS genre, count(m) AS movies
  ORDER BY movies DESC, genre ASC
  LIMIT $limit
`;
