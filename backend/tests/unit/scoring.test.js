import { describe, expect, it } from 'vitest';
import { RECOMMENDATION_CONFIG } from '../../src/config/recommendation.js';
import {
  buildGenreProfile,
  combineScores,
  effectiveWeights,
  genreScore,
  peopleScore,
  ratingScore,
  relatedScore,
  seedWeight,
} from '../../src/services/scoring.js';

describe('seedWeight', () => {
  it('weights likes and 5-star ratings fully and 4-star ratings at 0.8', () => {
    expect(seedWeight({ liked: true, rating: null })).toBe(1);
    expect(seedWeight({ liked: false, rating: 5 })).toBe(1);
    expect(seedWeight({ liked: false, rating: 4 })).toBe(0.8);
  });

  it('ignores ratings below the positive threshold', () => {
    expect(seedWeight({ liked: false, rating: 3 })).toBe(0);
  });
});

describe('buildGenreProfile', () => {
  it('sums seed weights per genre and adds preference bonuses', () => {
    const seeds = [
      { genreIds: ['sci-fi', 'drama'], weight: 1 },
      { genreIds: ['sci-fi'], weight: 0.8 },
    ];
    const { genreWeights, totalWeight } = buildGenreProfile(seeds, ['horror']);
    const byId = Object.fromEntries(genreWeights.map((g) => [g.genreId, g.weight]));
    expect(byId).toEqual({ 'sci-fi': 1.8, drama: 1, horror: RECOMMENDATION_CONFIG.preferenceWeight });
    expect(totalWeight).toBeCloseTo(3.8);
  });

  it('is empty for a user with no seeds and no preferences', () => {
    expect(buildGenreProfile([], [])).toEqual({ genreWeights: [], totalWeight: 0 });
  });
});

describe('component scores', () => {
  it('normalise to the 0..1 range', () => {
    expect(genreScore(1.8, 3.8)).toBeCloseTo(0.4737, 4);
    expect(genreScore(5, 0)).toBe(0);
    expect(peopleScore(1, 2)).toBe(0.5);
    expect(peopleScore(5, 2)).toBe(1); // saturates instead of exceeding 1
    expect(ratingScore(8.5)).toBe(0.85);
    expect(ratingScore(null)).toBe(0);
  });
});

describe('combineScores', () => {
  const all = { genre: true, actor: true, director: true, collaborative: true, rating: true };

  it('is the weighted average of the component scores', () => {
    const scores = { genre: 1, actor: 0, director: 0, collaborative: 0, rating: 0 };
    expect(combineScores(scores, all)).toBeCloseTo(RECOMMENDATION_CONFIG.weights.genre);
  });

  it('renormalises over available components instead of treating missing ones as zero', () => {
    const scores = { genre: 0.6, rating: 0.9 };
    const available = { genre: true, rating: true };
    const { genre, rating } = RECOMMENDATION_CONFIG.weights;
    expect(combineScores(scores, available)).toBeCloseTo((genre * 0.6 + rating * 0.9) / (genre + rating));
  });

  it('gives a perfect candidate a score of exactly 1', () => {
    const scores = { genre: 1, actor: 1, director: 1, collaborative: 1, rating: 1 };
    expect(combineScores(scores, all)).toBeCloseTo(1);
  });

  it('reports renormalised weights that sum to 1', () => {
    const weights = effectiveWeights({ genre: true, rating: true });
    expect(weights.actor).toBe(0);
    expect(weights.genre + weights.rating).toBeCloseTo(1);
  });
});

describe('relatedScore', () => {
  it('uses genre Jaccard similarity plus shared people and co-likes', () => {
    const { score, parts } = relatedScore({
      sharedGenres: 2,
      sharedActors: 1,
      sharedDirectors: 1,
      sourceGenreCount: 3,
      candidateGenreCount: 3,
      coLikedBy: 0,
    });
    expect(parts.genre).toBeCloseTo(2 / 4);
    expect(parts.actor).toBe(0.5);
    expect(parts.director).toBe(1);
    expect(score).toBeCloseTo(0.4 * 0.5 + 0.25 * 0.5 + 0.2 * 1);
  });
});
