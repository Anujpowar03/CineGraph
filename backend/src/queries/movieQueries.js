/**
 * Cypher for browsing, searching and describing movies.
 * All user input arrives through $parameters - never string concatenation.
 */

/** Reusable map projection: the fields a movie card needs. */
const MOVIE_CARD = `m {
  .movieId, .title, .releaseYear, .overview, .posterPath, .rating, .runtime,
  genres: [(m)-[:IN_GENRE]->(g:Genre) | g.name]
}`;

/**
 * Sorting cannot be parameterised in Cypher, so the API maps the requested sort
 * onto one of these fixed, whitelisted ORDER BY clauses.
 */
export const MOVIE_SORTS = {
  rating: { asc: 'm.rating ASC, m.title ASC', desc: 'm.rating DESC, m.title ASC' },
  title: { asc: 'm.title ASC', desc: 'm.title DESC' },
  year: { asc: 'm.releaseYear ASC, m.title ASC', desc: 'm.releaseYear DESC, m.title ASC' },
  added: { asc: 'm.addedAt ASC, m.title ASC', desc: 'm.addedAt DESC, m.title ASC' },
  popularity: { asc: 'engagement ASC, m.rating ASC', desc: 'engagement DESC, m.rating DESC' },
};

/**
 * Filtered + paginated catalogue.
 * Each filter is optional: "$x IS NULL OR ..." switches it off when not supplied.
 * The genre filter keeps movies connected to ANY of the selected genres.
 */
export function listMoviesQuery(orderBy) {
  return `
    MATCH (m:Movie)
    WHERE ($q IS NULL OR toLower(m.title) CONTAINS toLower($q))
      AND ($yearFrom IS NULL OR m.releaseYear >= $yearFrom)
      AND ($yearTo IS NULL OR m.releaseYear <= $yearTo)
      AND ($minRating IS NULL OR m.rating >= $minRating)
      AND (size($genres) = 0 OR EXISTS {
            MATCH (m)-[:IN_GENRE]->(g:Genre) WHERE g.genreId IN $genres
          })
    // engagement = how many user interactions point at the movie
    WITH m, COUNT { (m)<-[:LIKED|RATED|WATCHED]-(:User) } AS engagement
    ORDER BY ${orderBy}
    WITH collect(m) AS movies
    RETURN size(movies) AS total,
           [m IN movies[$skip..($skip + $limit)] | ${MOVIE_CARD}] AS items
  `;
}

/** Quick title search used by the navbar search box. */
export const SEARCH_MOVIES = `
  MATCH (m:Movie)
  WHERE toLower(m.title) CONTAINS toLower($q)
  RETURN ${MOVIE_CARD} AS movie
  // titles that START with the search text are listed first
  ORDER BY CASE WHEN toLower(m.title) STARTS WITH toLower($q) THEN 0 ELSE 1 END, m.rating DESC
  LIMIT $limit
`;

/** Movies with the most distinct users interacting with them. */
export const TRENDING_MOVIES = `
  MATCH (m:Movie)
  OPTIONAL MATCH (u:User)-[:LIKED|RATED|WATCHED]->(m)
  WITH m, count(DISTINCT u) AS engagedUsers
  WHERE engagedUsers > 0
  RETURN ${MOVIE_CARD} AS movie, engagedUsers
  ORDER BY engagedUsers DESC, m.rating DESC, m.title ASC
  LIMIT $limit
`;

/** Full movie page: genres, cast (in billing order), directors and community stats. */
export const MOVIE_DETAILS = `
  MATCH (m:Movie {movieId: $movieId})
  OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
  WITH m, collect(g {.genreId, .name}) AS genres
  OPTIONAL MATCH (a:Actor)-[r:ACTED_IN]->(m)
  WITH m, genres, a, r ORDER BY r.billingOrder ASC
  WITH m, genres, collect(a {.actorId, .name, billingOrder: r.billingOrder}) AS cast
  OPTIONAL MATCH (d:Director)-[:DIRECTED]->(m)
  WITH m, genres, cast, collect(d {.directorId, .name}) AS directors
  OPTIONAL MATCH (:User)-[rated:RATED]->(m)
  WITH m, genres, cast, directors, avg(rated.rating) AS communityRating, count(rated) AS ratingCount
  RETURN m {
    .*,
    genres: genres,
    cast: cast,
    directors: directors,
    communityRating: communityRating,
    ratingCount: ratingCount,
    likeCount: COUNT { (m)<-[:LIKED]-(:User) },
    watchCount: COUNT { (m)<-[:WATCHED]-(:User) }
  } AS movie
`;

/** The signed-in user's own relationship to one movie. */
export const USER_MOVIE_STATE = `
  MATCH (u:User {userId: $userId}), (m:Movie {movieId: $movieId})
  OPTIONAL MATCH (u)-[r:RATED]->(m)
  OPTIONAL MATCH (u)-[w:WATCHED]->(m)
  RETURN EXISTS { (u)-[:LIKED]->(m) } AS liked,
         r.rating AS rating,
         w.watchedAt AS watchedAt,
         w.watchCount AS watchCount
`;

/**
 * Related movies: every movie reachable in two hops through a shared Genre,
 * Actor or Director node. Collecting DISTINCT shared nodes per candidate means a
 * person or genre is counted once, however many paths lead to it.
 */
export const RELATED_MOVIES = `
  MATCH (m:Movie {movieId: $movieId})
  MATCH (m)-[:IN_GENRE|ACTED_IN|DIRECTED]-(shared)-[:IN_GENRE|ACTED_IN|DIRECTED]-(other:Movie)
  WHERE other <> m
  WITH m, other, collect(DISTINCT shared) AS sharedNodes
  WITH m, other,
       [x IN sharedNodes WHERE x:Genre | x.name] AS sharedGenres,
       [x IN sharedNodes WHERE x:Actor | x.name] AS sharedActors,
       [x IN sharedNodes WHERE x:Director | x.name] AS sharedDirectors
  RETURN other {
           .movieId, .title, .releaseYear, .posterPath, .rating, .overview,
           genres: [(other)-[:IN_GENRE]->(g:Genre) | g.name]
         } AS movie,
         sharedGenres, sharedActors, sharedDirectors,
         COUNT { (m)-[:IN_GENRE]->(:Genre) } AS sourceGenreCount,
         COUNT { (other)-[:IN_GENRE]->(:Genre) } AS candidateGenreCount,
         // users who liked BOTH movies (collaborative evidence)
         COUNT { (m)<-[:LIKED]-(:User)-[:LIKED]->(other) } AS coLikedBy
  ORDER BY size(sharedDirectors) DESC, size(sharedActors) DESC, size(sharedGenres) DESC
  LIMIT $candidateLimit
`;

/** Genre list with the number of movies in each genre. */
export const LIST_GENRES = `
  MATCH (g:Genre)
  RETURN g { .genreId, .name, movieCount: COUNT { (g)<-[:IN_GENRE]-(:Movie) } } AS genre
  ORDER BY g.name
`;

export const MOVIE_EXISTS = `
  MATCH (m:Movie {movieId: $movieId}) RETURN m.movieId AS movieId
`;

export const YEAR_RANGE = `
  MATCH (m:Movie) RETURN min(m.releaseYear) AS minYear, max(m.releaseYear) AS maxYear
`;
