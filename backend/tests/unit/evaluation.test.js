import { describe, expect, it } from 'vitest';
import { precisionRecall, splitHoldout } from '../../src/scripts/evaluateRecommendations.js';

describe('evaluation helpers', () => {
  it('holds out the most recent 25% of positive interactions (at least one)', () => {
    const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((movieId, i) => ({
      movieId,
      interactedAt: `2026-02-0${i + 1}T00:00:00Z`,
    }));
    const { train, test } = splitHoldout(seeds);
    expect(test.map((s) => s.movieId)).toEqual(['g', 'h']);
    expect(train).toHaveLength(6);
    expect(splitHoldout(seeds.slice(0, 2)).test).toHaveLength(1);
  });

  it('computes precision@K and recall@K', () => {
    const result = precisionRecall(['x', 'g', 'y', 'h', 'z'], new Set(['g', 'h', 'q']), 5);
    expect(result).toEqual({ hits: 2, precision: 0.4, recall: 2 / 3 });
  });
});
