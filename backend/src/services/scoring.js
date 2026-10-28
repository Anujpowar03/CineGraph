import { RECOMMENDATION_CONFIG } from '../config/recommendation.js';

/**
 * Pure scoring helpers - no database access, so they are easy to unit test and
 * to explain. Every function returns a value in the range 0..1.
 */

export const COMPONENTS = ['genre', 'actor', 'director', 'collaborative', 'rating'];

export const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export const round = (value, digits = 3) => Number(value.toFixed(digits));

/** Weight of a positive seed movie: like or 5 stars = 1.0, 4 stars = 0.8. */
export function seedWeight({ liked, rating }, config = RECOMMENDATION_CONFIG) {
  const { seedWeights, positiveRatingThreshold } = config;
  if (liked || rating >= 5) return seedWeights.liked;
  if (rating >= positiveRatingThreshold) return seedWeights.rating4;
  return 0;
}

/**
 * Builds the user's weighted genre profile:
 *   weight(genre) = Σ seedWeight of positive movies in that genre
 *                 + preferenceWeight if the user explicitly prefers the genre
 */
export function buildGenreProfile(seeds, preferredGenreIds = [], config = RECOMMENDATION_CONFIG) {
  const profile = new Map();
  for (const seed of seeds) {
    for (const genreId of seed.genreIds || []) {
      profile.set(genreId, (profile.get(genreId) || 0) + seed.weight);
    }
  }
  for (const genreId of preferredGenreIds) {
    profile.set(genreId, (profile.get(genreId) || 0) + config.preferenceWeight);
  }
  const genreWeights = [...profile.entries()].map(([genreId, weight]) => ({ genreId, weight: round(weight, 4) }));
  const totalWeight = genreWeights.reduce((sum, g) => sum + g.weight, 0);
  return { genreWeights, totalWeight };
}

/** Fraction of the user's genre profile that a candidate covers. */
export const genreScore = (genreRaw, totalWeight) => (totalWeight > 0 ? clamp01(genreRaw / totalWeight) : 0);

/** Shared-people score that saturates: e.g. 2 shared actors (saturation 2) -> 1.0. */
export const peopleScore = (raw, saturation) => clamp01(raw / saturation);

/** Catalogue rating (0-10) as a quality signal. */
export const ratingScore = (rating) => clamp01((rating ?? 0) / 10);

/**
 * Weighted average over the components that are available for this user.
 * @param {Record<string, number>} scores    component -> 0..1
 * @param {Record<string, boolean>} available component -> can it be computed?
 */
export function combineScores(scores, available, weights = RECOMMENDATION_CONFIG.weights) {
  let weighted = 0;
  let weightSum = 0;
  for (const component of COMPONENTS) {
    if (!available[component]) continue;
    weighted += weights[component] * (scores[component] ?? 0);
    weightSum += weights[component];
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 0;
}

/** The effective (renormalised) weights actually used for a user. */
export function effectiveWeights(available, weights = RECOMMENDATION_CONFIG.weights) {
  const active = COMPONENTS.filter((c) => available[c]);
  const sum = active.reduce((s, c) => s + weights[c], 0);
  return Object.fromEntries(COMPONENTS.map((c) => [c, available[c] && sum > 0 ? round(weights[c] / sum, 4) : 0]));
}

/**
 * Score for "related movies" on a movie page.
 *   0.40 × genre Jaccard + 0.25 × shared actors (sat. 2) + 0.20 × shared director
 *   + 0.15 × users who liked both (sat. 3)
 */
export function relatedScore(
  { sharedGenres, sharedActors, sharedDirectors, sourceGenreCount, candidateGenreCount, coLikedBy },
  config = RECOMMENDATION_CONFIG.related,
) {
  const union = sourceGenreCount + candidateGenreCount - sharedGenres;
  const parts = {
    genre: union > 0 ? sharedGenres / union : 0,
    actor: clamp01(sharedActors / config.actorSaturation),
    director: sharedDirectors > 0 ? 1 : 0,
    coLiked: clamp01(coLikedBy / config.coLikedSaturation),
  };
  const score = Object.entries(config.weights).reduce((sum, [k, w]) => sum + w * parts[k], 0);
  return { score: clamp01(score), parts };
}
