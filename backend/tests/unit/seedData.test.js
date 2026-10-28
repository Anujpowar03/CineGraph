import { describe, expect, it } from 'vitest';
import { GENRES } from '../../src/data/genres.js';
import { DEMO_USERS } from '../../src/data/users.js';
import { buildCatalogueRows, buildInteractionRows } from '../../src/scripts/seedDatabase.js';
import { slugify } from '../../src/utils/slugify.js';

describe('sample dataset', () => {
  const catalogue = buildCatalogueRows();
  const interactions = buildInteractionRows();

  it('meets the minimum size requirements', () => {
    expect(catalogue.movies.length).toBeGreaterThanOrEqual(50);
    expect(GENRES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(catalogue.actors.map((a) => a.actorId)).size).toBeGreaterThanOrEqual(20);
    expect(new Set(catalogue.directors.map((d) => d.directorId)).size).toBeGreaterThanOrEqual(10);
    expect(DEMO_USERS.length).toBeGreaterThanOrEqual(5);
  });

  it('uses unique, stable identifiers', () => {
    const ids = catalogue.movies.map((m) => m.movieId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(DEMO_USERS.map((u) => u.email)).size).toBe(DEMO_USERS.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it('only references genres and movies that exist', () => {
    const genreIds = new Set(GENRES.map((g) => g.genreId));
    const movieIds = new Set(catalogue.movies.map((m) => m.movieId));
    catalogue.movieGenres.forEach((row) => expect(genreIds.has(row.genreId)).toBe(true));
    [...interactions.likes, ...interactions.ratings, ...interactions.watches].forEach((row) =>
      expect(movieIds.has(row.movieId)).toBe(true),
    );
    interactions.preferences.forEach((row) => expect(genreIds.has(row.genreId)).toBe(true));
  });

  it('keeps ratings within 1-5 and produces deterministic timestamps', () => {
    interactions.ratings.forEach((r) => expect(r.rating).toBeGreaterThanOrEqual(1));
    interactions.ratings.forEach((r) => expect(r.rating).toBeLessThanOrEqual(5));
    expect(buildInteractionRows()).toEqual(interactions);
  });

  it('builds slug ids for people with accents and punctuation', () => {
    expect(slugify('Zoe Saldaña')).toBe('zoe-saldana');
    expect(slugify('Alejandro G. Iñárritu')).toBe('alejandro-g-inarritu');
    expect(slugify('Lupita Nyong’o')).toBe('lupita-nyongo');
  });
});
