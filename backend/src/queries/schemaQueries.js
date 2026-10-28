/**
 * Constraints and indexes (Neo4j 5.x / 2025.x syntax).
 *
 * - A UNIQUENESS constraint guarantees that no two nodes with the same label
 *   share a property value. It also creates a backing index, so lookups such as
 *   MATCH (m:Movie {movieId: $id}) are fast and MERGE never creates duplicates.
 * - "IF NOT EXISTS" makes every statement safe to run repeatedly.
 * - Older Neo4j 4.x used "CREATE CONSTRAINT ON (m:Movie) ASSERT m.movieId IS UNIQUE";
 *   that form was removed in Neo4j 5, which uses "FOR ... REQUIRE".
 */
export const CONSTRAINTS = [
  'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.userId IS UNIQUE',
  'CREATE CONSTRAINT user_email_unique IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
  'CREATE CONSTRAINT movie_id_unique IF NOT EXISTS FOR (m:Movie) REQUIRE m.movieId IS UNIQUE',
  'CREATE CONSTRAINT genre_id_unique IF NOT EXISTS FOR (g:Genre) REQUIRE g.genreId IS UNIQUE',
  'CREATE CONSTRAINT genre_name_unique IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE',
  'CREATE CONSTRAINT actor_id_unique IF NOT EXISTS FOR (a:Actor) REQUIRE a.actorId IS UNIQUE',
  'CREATE CONSTRAINT director_id_unique IF NOT EXISTS FOR (d:Director) REQUIRE d.directorId IS UNIQUE',
];

/** Range indexes for properties used in filters and sorting. */
export const INDEXES = [
  'CREATE INDEX movie_title IF NOT EXISTS FOR (m:Movie) ON (m.title)',
  'CREATE INDEX movie_release_year IF NOT EXISTS FOR (m:Movie) ON (m.releaseYear)',
  'CREATE INDEX movie_rating IF NOT EXISTS FOR (m:Movie) ON (m.rating)',
  'CREATE INDEX movie_added_at IF NOT EXISTS FOR (m:Movie) ON (m.addedAt)',
  'CREATE INDEX actor_name IF NOT EXISTS FOR (a:Actor) ON (a.name)',
  'CREATE INDEX director_name IF NOT EXISTS FOR (d:Director) ON (d.name)',
];
