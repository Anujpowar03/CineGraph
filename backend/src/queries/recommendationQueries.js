/**
 * Recommendation Cypher.
 *
 * Shared vocabulary
 * -----------------
 * - "Positive" movie: the user LIKED it or RATED it >= $minPositiveRating (4).
 * - Seeds ($seeds): the user's positive movies as [{movieId, weight}], computed
 *   by USER_TASTE_PROFILE below. Passing seeds in as a parameter lets the
 *   offline evaluation hide test movies without touching the database.
 * - $excludeIds: movies the user already liked, rated or watched. They are never
 *   recommended again (documented eligibility policy).
 *
 * Avoiding inflated scores
 * ------------------------
 * A candidate can be reached through many paths (several genres, several
 * actors, several seed movies). Each query first aggregates to ONE row per
 * (candidate, genre) / (candidate, actor) / (candidate, similar user) and only
 * then sums, so the same genre, person or user is never counted twice.
 */

/**
 * Step 0 - the user's taste profile.
 * Returns each positive seed once (max() picks the strongest signal if the user
 * both liked and rated it), plus explicit genre preferences and the set of
 * already-consumed movies.
 */
export const USER_TASTE_PROFILE = `
  MATCH (u:User {userId: $userId})
  OPTIONAL MATCH (u)-[r:LIKED|RATED]->(seed:Movie)
  WHERE type(r) = 'LIKED' OR r.rating >= $minPositiveRating
  WITH u, seed,
       max(CASE WHEN type(r) = 'LIKED' THEN 1 ELSE 0 END) AS liked,
       max(CASE WHEN type(r) = 'RATED' THEN r.rating END) AS rating,
       max(CASE WHEN type(r) = 'LIKED' THEN r.likedAt ELSE r.ratedAt END) AS interactedAt
  WITH u, collect(CASE WHEN seed IS NOT NULL THEN {
         movieId: seed.movieId,
         title: seed.title,
         liked: liked = 1,
         rating: rating,
         interactedAt: interactedAt,
         genreIds: [(seed)-[:IN_GENRE]->(g:Genre) | g.genreId]
       } END) AS seeds
  OPTIONAL MATCH (u)-[:PREFERS]->(pg:Genre)
  WITH u, seeds, collect(pg { .genreId, .name }) AS preferredGenres
  OPTIONAL MATCH (u)-[:LIKED|RATED|WATCHED]->(consumed:Movie)
  RETURN seeds, preferredGenres, collect(DISTINCT consumed.movieId) AS consumedIds
`;

/** Name lookup for the genres in a profile (ids -> display names). */
export const GENRE_NAMES = `
  MATCH (g:Genre) WHERE g.genreId IN $genreIds
  RETURN g.genreId AS genreId, g.name AS name
`;

/**
 * Algorithm A - genre-based candidates.
 * $genreWeights = [{genreId, weight}] is the user's weighted genre profile
 * (sum of seed weights per genre + a bonus for explicitly preferred genres).
 *
 * Seed -> Genre -> Candidate. Because each genre appears once in
 * $genreWeights and a movie has at most one IN_GENRE edge per genre, every
 * (candidate, genre) pair contributes exactly once to genreRaw.
 * seedOverlaps lists which seed movies share which genres with the candidate,
 * so the explanation can name a concrete "because you liked ..." movie.
 */
export const GENRE_CANDIDATES = `
  UNWIND $genreWeights AS gw
  MATCH (g:Genre {genreId: gw.genreId})<-[:IN_GENRE]-(c:Movie)
  WHERE NOT c.movieId IN $excludeIds
  WITH c, collect(g.name) AS sharedGenres, sum(gw.weight) AS genreRaw
  ORDER BY genreRaw DESC, c.rating DESC
  LIMIT $candidateLimit
  OPTIONAL MATCH (c)-[:IN_GENRE]->(sg:Genre)<-[:IN_GENRE]-(s:Movie)
  WHERE s.movieId IN $seedIds
  WITH c, sharedGenres, genreRaw, s, collect(sg.name) AS overlap
  WITH c, sharedGenres, genreRaw,
       collect(CASE WHEN s IS NOT NULL THEN {movieId: s.movieId, title: s.title, genres: overlap} END) AS seedOverlaps
  RETURN c.movieId AS movieId, sharedGenres, genreRaw, seedOverlaps
`;

/**
 * Algorithm B (part 1) - actor-based candidates.
 * Seed <-ACTED_IN- Actor -ACTED_IN-> Candidate.
 * Grouping by (candidate, actor) first means an actor who links the candidate
 * to three different seeds is still counted once, with the strongest seed weight.
 */
export const ACTOR_CANDIDATES = `
  UNWIND $seeds AS seed
  MATCH (s:Movie {movieId: seed.movieId})<-[:ACTED_IN]-(a:Actor)-[:ACTED_IN]->(c:Movie)
  WHERE NOT c.movieId IN $excludeIds AND c.movieId <> s.movieId
  WITH c, a, max(seed.weight) AS personWeight, collect(DISTINCT s.title) AS via
  WITH c, collect({id: a.actorId, name: a.name, weight: personWeight, via: via}) AS people,
       sum(personWeight) AS raw
  RETURN c.movieId AS movieId, people, raw
  ORDER BY raw DESC
  LIMIT $candidateLimit
`;

/** Algorithm B (part 2) - director-based candidates (same shape as actors). */
export const DIRECTOR_CANDIDATES = `
  UNWIND $seeds AS seed
  MATCH (s:Movie {movieId: seed.movieId})<-[:DIRECTED]-(d:Director)-[:DIRECTED]->(c:Movie)
  WHERE NOT c.movieId IN $excludeIds AND c.movieId <> s.movieId
  WITH c, d, max(seed.weight) AS personWeight, collect(DISTINCT s.title) AS via
  WITH c, collect({id: d.directorId, name: d.name, weight: personWeight, via: via}) AS people,
       sum(personWeight) AS raw
  RETURN c.movieId AS movieId, people, raw
  ORDER BY raw DESC
  LIMIT $candidateLimit
`;

/**
 * Algorithm C (part 1) - similar users.
 * Seed <-LIKED|RATED- OtherUser. Similarity is the Jaccard index of the two
 * users' positive-movie sets:  |A ∩ B| / |A ∪ B|  =  overlap / (|A| + |B| - overlap).
 */
export const SIMILAR_USERS = `
  UNWIND $seeds AS seed
  MATCH (s:Movie {movieId: seed.movieId})<-[r:LIKED|RATED]-(other:User)
  WHERE other.userId <> $userId
    AND (type(r) = 'LIKED' OR r.rating >= $minPositiveRating)
  WITH other, collect(DISTINCT s) AS sharedMovies
  WHERE size(sharedMovies) >= $minSharedMovies
  MATCH (other)-[r2:LIKED|RATED]->(p:Movie)
  WHERE type(r2) = 'LIKED' OR r2.rating >= $minPositiveRating
  WITH other, sharedMovies, count(DISTINCT p) AS otherPositiveCount
  WITH other, sharedMovies,
       toFloat(size(sharedMovies)) / (size($seeds) + otherPositiveCount - size(sharedMovies)) AS similarity
  RETURN other.userId AS userId, other.name AS name, similarity,
         size(sharedMovies) AS sharedCount, [x IN sharedMovies | x.title] AS sharedTitles
  ORDER BY similarity DESC, sharedCount DESC, name ASC
  LIMIT $maxSimilarUsers
`;

/**
 * Algorithm C (part 2) - collaborative candidates.
 * SimilarUser -LIKED|RATED-> Candidate. One row per (candidate, similar user)
 * keeps each neighbour's vote single; strength is 1.0 for a like or 5 stars and
 * 0.8 for 4 stars. The score is the similarity-weighted share of the
 * neighbourhood that endorses the movie, so it always lies between 0 and 1.
 */
export const COLLABORATIVE_CANDIDATES = `
  UNWIND $neighbours AS n
  MATCH (other:User {userId: n.userId})-[r:LIKED|RATED]->(c:Movie)
  WHERE (type(r) = 'LIKED' OR r.rating >= $minPositiveRating)
    AND NOT c.movieId IN $excludeIds
  WITH c, n, max(CASE WHEN type(r) = 'LIKED' OR r.rating >= 5 THEN 1.0 ELSE 0.8 END) AS strength
  WITH c, collect({userId: n.userId, similarity: n.similarity, strength: strength}) AS endorsers,
       sum(n.similarity * strength) AS weightedVotes
  RETURN c.movieId AS movieId, endorsers, size(endorsers) AS similarUserCount,
         weightedVotes / $totalSimilarity AS collaborativeScore
  ORDER BY collaborativeScore DESC
  LIMIT $candidateLimit
`;

/** Card data for the final, ranked recommendations. */
export const MOVIES_BY_IDS = `
  MATCH (m:Movie) WHERE m.movieId IN $movieIds
  RETURN m {
    .movieId, .title, .releaseYear, .posterPath, .rating, .overview, .runtime,
    genres: [(m)-[:IN_GENRE]->(g:Genre) | g.name]
  } AS movie
`;

/** Quality signal for every candidate (catalogue rating, 0-10). */
export const MOVIE_RATINGS = `
  MATCH (m:Movie) WHERE m.movieId IN $movieIds
  RETURN m.movieId AS movieId, m.rating AS rating
`;

/**
 * Fallback for users with no history and no preferences: the movies most users
 * engaged with. Clearly labelled as NOT personalised.
 */
export const POPULAR_FALLBACK = `
  MATCH (m:Movie)
  WHERE NOT m.movieId IN $excludeIds
  // the requesting user is not counted (keeps offline evaluation leak-free)
  OPTIONAL MATCH (u:User)-[:LIKED|RATED|WATCHED]->(m)
  WHERE u.userId <> $userId
  WITH m, count(DISTINCT u) AS engagedUsers
  RETURN m.movieId AS movieId, engagedUsers
  ORDER BY engagedUsers DESC, m.rating DESC, m.title ASC
  LIMIT $limit
`;
