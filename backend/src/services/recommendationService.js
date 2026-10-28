import { RECOMMENDATION_CONFIG as CONFIG } from '../config/recommendation.js';
import * as repo from '../repositories/recommendationRepository.js';
import { ApiError } from '../utils/ApiError.js';
import { buildExplanation } from './explanations.js';
import {
  buildGenreProfile,
  combineScores,
  effectiveWeights,
  genreScore,
  peopleScore,
  ratingScore,
  round,
  seedWeight,
} from './scoring.js';

/**
 * Recommendation engine
 * =====================
 * 1. Load the user's taste profile from the graph (positive seeds, preferences,
 *    already-consumed movies).
 * 2. Run the graph traversals for the requested algorithm(s):
 *      A. genre          Seed -> Genre -> Candidate
 *      B. actor/director Seed <- Person -> Candidate
 *      C. collaborative  Seed <- SimilarUser -> Candidate
 * 3. Normalise each signal to 0..1, combine with the configured weights
 *    (renormalised over the components available for this user).
 * 4. Rank deterministically and attach an evidence-based explanation.
 */

/** Which score components each public strategy uses. */
export const STRATEGIES = {
  hybrid: ['genre', 'actor', 'director', 'collaborative', 'rating'],
  genre: ['genre', 'rating'],
  people: ['actor', 'director', 'rating'],
  collaborative: ['collaborative', 'rating'],
};

/**
 * Loads the profile. `holdoutIds` hides selected interactions - used only by
 * the offline evaluation so test movies are never used to produce predictions.
 */
export async function loadProfile(userId, { holdoutIds = [] } = {}) {
  const row = await repo.getTasteProfile(userId, CONFIG.positiveRatingThreshold);
  if (!row) throw ApiError.notFound('User not found');
  const hidden = new Set(holdoutIds);
  const seeds = row.seeds
    .filter((seed) => !hidden.has(seed.movieId))
    .map((seed) => ({ ...seed, weight: seedWeight(seed) }))
    .filter((seed) => seed.weight > 0);
  return {
    userId,
    seeds,
    preferredGenres: row.preferredGenres,
    consumedIds: row.consumedIds.filter((id) => !hidden.has(id)),
  };
}

async function genreSignal(profile) {
  const { genreWeights, totalWeight } = buildGenreProfile(
    profile.seeds,
    profile.preferredGenres.map((g) => g.genreId),
  );
  if (totalWeight === 0) return { available: false, candidates: new Map(), genreWeights, totalWeight };
  const rows = await repo.getGenreCandidates({
    genreWeights,
    excludeIds: profile.consumedIds,
    seedIds: profile.seeds.map((s) => s.movieId),
    candidateLimit: CONFIG.candidateLimit,
  });
  const candidates = new Map(
    rows.map((r) => [
      r.movieId,
      {
        score: genreScore(r.genreRaw, totalWeight),
        sharedGenres: [...r.sharedGenres].sort(),
        seedOverlaps: r.seedOverlaps.map((s) => ({ ...s, genres: [...s.genres].sort() })),
      },
    ]),
  );
  return { available: true, candidates, genreWeights, totalWeight };
}

async function peopleSignal(profile, kind) {
  if (profile.seeds.length === 0) return { available: false, candidates: new Map() };
  const params = {
    seeds: profile.seeds.map(({ movieId, weight }) => ({ movieId, weight })),
    excludeIds: profile.consumedIds,
    candidateLimit: CONFIG.candidateLimit,
  };
  const rows = kind === 'actor' ? await repo.getActorCandidates(params) : await repo.getDirectorCandidates(params);
  const saturation = kind === 'actor' ? CONFIG.actorSaturation : CONFIG.directorSaturation;
  const candidates = new Map(
    rows.map((r) => [
      r.movieId,
      {
        score: peopleScore(r.raw, saturation),
        people: r.people
          .map((p) => ({ id: p.id, name: p.name, via: [...p.via].sort() }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      },
    ]),
  );
  return { available: true, candidates };
}

async function collaborativeSignal(profile) {
  if (profile.seeds.length === 0) return { available: false, candidates: new Map(), similarUsers: [] };
  const similarUsers = await repo.getSimilarUsers({
    userId: profile.userId,
    seeds: profile.seeds.map(({ movieId, weight }) => ({ movieId, weight })),
    minPositiveRating: CONFIG.positiveRatingThreshold,
    minSharedMovies: CONFIG.minSharedMovies,
    maxSimilarUsers: CONFIG.maxSimilarUsers,
  });
  if (similarUsers.length === 0) return { available: false, candidates: new Map(), similarUsers };
  const totalSimilarity = similarUsers.reduce((sum, u) => sum + u.similarity, 0);
  const rows = await repo.getCollaborativeCandidates({
    neighbours: similarUsers.map(({ userId, similarity }) => ({ userId, similarity })),
    totalSimilarity,
    excludeIds: profile.consumedIds,
    minPositiveRating: CONFIG.positiveRatingThreshold,
    candidateLimit: CONFIG.candidateLimit,
  });
  const candidates = new Map(
    rows.map((r) => [r.movieId, { score: r.collaborativeScore, similarUserCount: r.similarUserCount }]),
  );
  return { available: true, candidates, similarUsers };
}

const EMPTY_SIGNAL = { available: false, candidates: new Map() };

/** Fallback for users with no likes, ratings or preferences. */
async function popularFallback(profile, limit) {
  const rows = await repo.getPopularMovies(profile.userId, profile.consumedIds, limit);
  const movies = await repo.getMoviesByIds(rows.map((r) => r.movieId));
  return rows.map((r) => {
    const movie = movies.get(r.movieId);
    const explanation = buildExplanation({ movie, mode: 'popular', engagedUsers: r.engagedUsers });
    return {
      ...movie,
      finalScore: null,
      matchPercent: null,
      components: null,
      sharedGenres: [],
      sharedActors: [],
      sharedDirectors: [],
      similarUserCount: 0,
      engagedUsers: r.engagedUsers,
      ...explanation,
    };
  });
}

/**
 * Produces ranked recommendations for an already-loaded profile.
 * @param {object} profile  result of loadProfile()
 * @param {object} options  { strategy: 'hybrid'|'genre'|'people'|'collaborative', limit }
 */
export async function recommendForProfile(profile, { strategy = 'hybrid', limit = CONFIG.defaultLimit } = {}) {
  const components = STRATEGIES[strategy];
  if (!components) throw ApiError.badRequest(`Unknown strategy "${strategy}"`);

  const hasSeeds = profile.seeds.length > 0;
  const hasPreferences = profile.preferredGenres.length > 0;

  const base = {
    strategy,
    profile: {
      seedCount: profile.seeds.length,
      seedMovies: profile.seeds.map((s) => ({ movieId: s.movieId, title: s.title, liked: s.liked, rating: s.rating })),
      preferredGenres: profile.preferredGenres,
      consumedCount: profile.consumedIds.length,
    },
  };

  // Cold start, case 1: nothing at all is known about the user.
  if (!hasSeeds && !hasPreferences) {
    if (strategy !== 'hybrid') {
      return {
        ...base,
        mode: 'empty',
        message: 'Like or rate a few movies to unlock this algorithm.',
        similarUsers: [],
        weights: null,
        items: [],
      };
    }
    return {
      ...base,
      mode: 'popular',
      message: 'You have no likes, ratings or preferred genres yet, so these are popular picks rather than personal ones.',
      similarUsers: [],
      weights: null,
      items: await popularFallback(profile, limit),
    };
  }

  const uses = (c) => components.includes(c);
  const [genre, actor, director, collaborative] = await Promise.all([
    uses('genre') ? genreSignal(profile) : EMPTY_SIGNAL,
    uses('actor') ? peopleSignal(profile, 'actor') : EMPTY_SIGNAL,
    uses('director') ? peopleSignal(profile, 'director') : EMPTY_SIGNAL,
    uses('collaborative') ? collaborativeSignal(profile) : { ...EMPTY_SIGNAL, similarUsers: [] },
  ]);

  const available = {
    genre: genre.available,
    actor: actor.available,
    director: director.available,
    collaborative: collaborative.available,
    rating: true,
  };

  // A movie is a candidate only if a graph relationship connects it to the user.
  const candidateIds = new Set([
    ...genre.candidates.keys(),
    ...actor.candidates.keys(),
    ...director.candidates.keys(),
    ...collaborative.candidates.keys(),
  ]);

  // Cold start, case 2: only genre preferences are known.
  const mode = hasSeeds ? 'personalised' : 'preference-based';
  const message =
    mode === 'preference-based'
      ? 'These picks are based on the genres you chose. Like or rate movies to unlock actor, director and similar-user signals.'
      : null;

  if (candidateIds.size === 0) {
    const emptyMessage =
      strategy === 'collaborative'
        ? 'No other users share your liked movies yet, so collaborative filtering has no evidence.'
        : strategy === 'people' && !hasSeeds
          ? 'Like or rate a few movies to find films with the same actors and directors.'
          : 'No new movies are connected to your taste profile yet.';
    return {
      ...base,
      mode,
      message: emptyMessage,
      similarUsers: collaborative.similarUsers ?? [],
      weights: effectiveWeights(available),
      items: [],
    };
  }

  const movies = await repo.getMoviesByIds([...candidateIds]);
  const preferredGenreNames = profile.preferredGenres.map((g) => g.name);
  const seedsByTitle = new Map(profile.seeds.map((s) => [s.title, s]));

  const scored = [...candidateIds]
    .filter((id) => movies.has(id))
    .map((movieId) => {
      const movie = movies.get(movieId);
      const g = genre.candidates.get(movieId);
      const a = actor.candidates.get(movieId);
      const d = director.candidates.get(movieId);
      const c = collaborative.candidates.get(movieId);
      const scores = {
        genre: g?.score ?? 0,
        actor: a?.score ?? 0,
        director: d?.score ?? 0,
        collaborative: c?.score ?? 0,
        rating: ratingScore(movie.rating),
      };
      const finalScore = combineScores(scores, available);
      return { movie, scores, finalScore, g, a, d, c };
    });

  scored.sort(
    (x, y) =>
      y.finalScore - x.finalScore ||
      (y.movie.rating ?? 0) - (x.movie.rating ?? 0) ||
      x.movie.title.localeCompare(y.movie.title),
  );

  const items = scored.slice(0, limit).map(({ movie, scores, finalScore, g, a, d, c }) => {
    const explanation = buildExplanation({
      movie,
      sharedGenres: g?.sharedGenres ?? [],
      preferredGenreNames,
      seedOverlaps: g?.seedOverlaps ?? [],
      actors: a?.people ?? [],
      directors: d?.people ?? [],
      similarUserCount: c?.similarUserCount ?? 0,
      seedsByTitle,
      mode,
    });
    return {
      ...movie,
      finalScore: round(finalScore),
      matchPercent: Math.round(finalScore * 100),
      components: Object.fromEntries(
        Object.entries(scores).map(([k, v]) => [k, available[k] ? round(v) : null]),
      ),
      sharedGenres: g?.sharedGenres ?? [],
      sharedActors: a?.people ?? [],
      sharedDirectors: d?.people ?? [],
      similarUserCount: c?.similarUserCount ?? 0,
      ...explanation,
    };
  });

  return {
    ...base,
    mode,
    message,
    weights: effectiveWeights(available),
    similarUsers: (collaborative.similarUsers ?? []).map((u) => ({
      ...u,
      similarity: round(u.similarity),
    })),
    items,
  };
}

export async function recommendForUser(userId, options) {
  const profile = await loadProfile(userId);
  return recommendForProfile(profile, options);
}

/** Similar users only (for the "people like you" panel). */
export async function similarUsersFor(userId) {
  const profile = await loadProfile(userId);
  const { similarUsers } = await collaborativeSignal(profile);
  return similarUsers.map((u) => ({ ...u, similarity: round(u.similarity) }));
}
