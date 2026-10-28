import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/repositories/recommendationRepository.js', () => ({
  getTasteProfile: vi.fn(),
  getGenreNames: vi.fn(),
  getGenreCandidates: vi.fn(),
  getActorCandidates: vi.fn(),
  getDirectorCandidates: vi.fn(),
  getSimilarUsers: vi.fn(),
  getCollaborativeCandidates: vi.fn(),
  getMoviesByIds: vi.fn(),
  getPopularMovies: vi.fn(),
}));

const repo = await import('../../src/repositories/recommendationRepository.js');
const { loadProfile, recommendForProfile } = await import('../../src/services/recommendationService.js');

const movie = (movieId, title, rating) => ({ movieId, title, rating, genres: [] });

beforeEach(() => vi.clearAllMocks());

describe('recommendation engine (repository mocked)', () => {
  it('drops held-out movies from both the seeds and the exclusion list', async () => {
    repo.getTasteProfile.mockResolvedValue({
      seeds: [
        { movieId: 'a', title: 'A', liked: true, rating: null, genreIds: ['x'] },
        { movieId: 'b', title: 'B', liked: false, rating: 4, genreIds: ['x'] },
      ],
      preferredGenres: [],
      consumedIds: ['a', 'b', 'c'],
    });
    const profile = await loadProfile('u', { holdoutIds: ['b'] });
    expect(profile.seeds.map((s) => s.movieId)).toEqual(['a']);
    expect(profile.consumedIds).toEqual(['a', 'c']);
  });

  it('returns clearly labelled popular picks for a user with no data', async () => {
    repo.getPopularMovies.mockResolvedValue([{ movieId: 'm1', engagedUsers: 3 }]);
    repo.getMoviesByIds.mockResolvedValue(new Map([['m1', movie('m1', 'M1', 8.8)]]));
    const result = await recommendForProfile({ userId: 'u', seeds: [], preferredGenres: [], consumedIds: [] });
    expect(result.mode).toBe('popular');
    expect(result.items[0].finalScore).toBeNull();
    expect(result.items[0].headline).toMatch(/Popular on CineGraph/);
  });

  it('returns an empty state (not an error) for collaborative filtering without history', async () => {
    const result = await recommendForProfile(
      { userId: 'u', seeds: [], preferredGenres: [], consumedIds: [] },
      { strategy: 'collaborative' },
    );
    expect(result.items).toEqual([]);
    expect(result.message).toBeTruthy();
  });

  it('marks unavailable components as null and ranks by the renormalised score', async () => {
    const profile = {
      userId: 'u',
      seeds: [{ movieId: 's', title: 'Seed', liked: true, rating: null, weight: 1, genreIds: ['sci-fi'] }],
      preferredGenres: [],
      consumedIds: ['s'],
    };
    repo.getGenreCandidates.mockResolvedValue([
      { movieId: 'hi', sharedGenres: ['Sci-Fi'], genreRaw: 1, seedOverlaps: [{ movieId: 's', title: 'Seed', genres: ['Sci-Fi'] }] },
      { movieId: 'lo', sharedGenres: ['Sci-Fi'], genreRaw: 1, seedOverlaps: [{ movieId: 's', title: 'Seed', genres: ['Sci-Fi'] }] },
    ]);
    repo.getActorCandidates.mockResolvedValue([]);
    repo.getDirectorCandidates.mockResolvedValue([]);
    repo.getSimilarUsers.mockResolvedValue([]); // no neighbours -> collaborative unavailable
    repo.getMoviesByIds.mockResolvedValue(
      new Map([
        ['hi', movie('hi', 'High', 9)],
        ['lo', movie('lo', 'Low', 6)],
      ]),
    );
    const result = await recommendForProfile(profile);
    expect(result.weights.collaborative).toBe(0);
    expect(result.items.map((i) => i.movieId)).toEqual(['hi', 'lo']);
    expect(result.items[0].components.collaborative).toBeNull();
    expect(result.items[0].finalScore).toBeGreaterThan(result.items[1].finalScore);
    expect(result.items[0].headline).toBe('Recommended because you liked Seed: it shares the Sci-Fi genre.');
    expect(repo.getCollaborativeCandidates).not.toHaveBeenCalled();
  });
});
