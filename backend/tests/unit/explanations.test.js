import { describe, expect, it } from 'vitest';
import { buildExplanation, joinNames, pickAnchor, sharedWithAnchor } from '../../src/services/explanations.js';

const seedsByTitle = new Map([
  ['Inception', { title: 'Inception', liked: true, rating: 5 }],
  ['Arrival', { title: 'Arrival', liked: false, rating: 4 }],
]);

describe('joinNames', () => {
  it('produces natural lists', () => {
    expect(joinNames([])).toBe('');
    expect(joinNames(['A'])).toBe('A');
    expect(joinNames(['A', 'B'])).toBe('A and B');
    expect(joinNames(['A', 'B', 'C'])).toBe('A, B and C');
  });
});

describe('pickAnchor', () => {
  it('prefers the seed linked by director, then actors, then genres', () => {
    const anchor = pickAnchor({
      seedOverlaps: [
        { title: 'Arrival', genres: ['Drama', 'Mystery', 'Sci-Fi'] },
        { title: 'Inception', genres: ['Sci-Fi'] },
      ],
      directors: [{ name: 'Christopher Nolan', via: ['Inception'] }],
      actors: [],
    });
    expect(anchor).toBe('Inception'); // 3 (director) + 1 (genre) > 3 (genres)
  });

  it('returns null when nothing links the candidate to a seed', () => {
    expect(pickAnchor({})).toBeNull();
  });
});

describe('buildExplanation', () => {
  it('only mentions relationships that are present in the evidence', () => {
    const evidence = {
      seedOverlaps: [{ title: 'Inception', genres: ['Sci-Fi', 'Thriller'] }],
      actors: [],
      directors: [{ name: 'Christopher Nolan', via: ['Inception'] }],
    };
    const { headline, reasons, anchorMovie } = buildExplanation({
      movie: { title: 'Tenet', rating: 7.3 },
      sharedGenres: ['Action', 'Sci-Fi', 'Thriller'],
      seedsByTitle,
      ...evidence,
    });
    expect(anchorMovie).toBe('Inception');
    expect(headline).toBe(
      'Recommended because you liked Inception: it shares director Christopher Nolan and the Sci-Fi and Thriller genres.',
    );
    expect(sharedWithAnchor('Inception', evidence).actors).toEqual([]);
    expect(reasons.join(' ')).not.toMatch(/Stars/); // no actor claims without actor evidence
    expect(reasons.join(' ')).not.toMatch(/Catalogue rating/); // 7.3 is below the 8.0 mention threshold
  });

  it('describes rated (not liked) seeds accurately', () => {
    const { headline } = buildExplanation({
      movie: { title: 'Dune', rating: 8 },
      seedOverlaps: [{ title: 'Arrival', genres: ['Sci-Fi'] }],
      directors: [{ name: 'Denis Villeneuve', via: ['Arrival'] }],
      seedsByTitle,
    });
    expect(headline).toContain('you rated Arrival 4★');
  });

  it('falls back to similar-user evidence when no seed is linked', () => {
    const { headline, reasons } = buildExplanation({
      movie: { title: 'Alien', rating: 8.5 },
      similarUserCount: 2,
    });
    expect(headline).toBe('Liked by 2 users whose taste overlaps with yours.');
    expect(reasons).toContain('Liked or rated 4★+ by 2 users with similar taste');
  });

  it('labels preference-based and popular recommendations honestly', () => {
    const pref = buildExplanation({
      movie: { title: 'Get Out', rating: 7.8 },
      sharedGenres: ['Horror'],
      preferredGenreNames: ['Horror'],
      mode: 'preference-based',
    });
    expect(pref.headline).toBe('Matches your preferred genre: Horror.');
    const popular = buildExplanation({ movie: { title: 'Inception', rating: 8.8 }, mode: 'popular', engagedUsers: 3 });
    expect(popular.headline).toContain('Popular on CineGraph');
    expect(popular.reasons[0]).toMatch(/Not personalised/);
  });
});
