/**
 * ALL recommendation tuning lives in this one module.
 *
 * Hybrid score
 * ------------
 *   finalScore = Σ (weight_c × score_c) / Σ weight_c      over AVAILABLE components c
 *
 * Every component score is normalised to the range 0..1, so finalScore is also
 * 0..1 and can be shown as a "match %". A component is unavailable when it
 * cannot be computed for this user (e.g. collaborative filtering for a user
 * with no similar users); its weight is then dropped from both the numerator
 * and the denominator instead of silently counting as zero.
 */
export const RECOMMENDATION_CONFIG = Object.freeze({
  weights: Object.freeze({
    genre: 0.3, // share of the user's weighted genre profile the movie covers
    actor: 0.15, // shared actors with liked movies (saturates at actorSaturation)
    director: 0.15, // shared director with liked movies
    collaborative: 0.25, // similarity-weighted share of similar users who liked it
    rating: 0.15, // catalogue quality signal: rating / 10
  }),

  /** A rating of 4 or 5 stars counts as a positive signal, like a "like". */
  positiveRatingThreshold: 4,

  /** How strongly each positive seed movie counts. */
  seedWeights: Object.freeze({ liked: 1.0, rating5: 1.0, rating4: 0.8 }),

  /** Extra genre-profile weight for each genre the user explicitly prefers. */
  preferenceWeight: 1.0,

  /** Number of distinct shared actors/directors that earns the full score of 1. */
  actorSaturation: 2,
  directorSaturation: 1,

  /** Collaborative filtering neighbourhood. */
  maxSimilarUsers: 20,
  minSharedMovies: 1,

  /** Safety caps on the number of candidates each query may return. */
  candidateLimit: 300,
  defaultLimit: 12,
  maxLimit: 50,

  /** Weights for "related movies" on the movie details page. */
  related: Object.freeze({
    weights: Object.freeze({ genre: 0.4, actor: 0.25, director: 0.2, coLiked: 0.15 }),
    actorSaturation: 2,
    coLikedSaturation: 3,
    candidateLimit: 60,
  }),
});
