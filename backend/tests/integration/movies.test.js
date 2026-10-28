import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { closeDriver } from '../../src/config/neo4j.js';
import { app } from './helpers.js';

afterAll(() => closeDriver());

describe('movie catalogue API', () => {
  it('searches by title (case-insensitive, prefix matches first)', async () => {
    const res = await request(app).get('/api/movies/search?q=dark');
    expect(res.status).toBe(200);
    const titles = res.body.data.map((m) => m.title);
    expect(titles).toEqual(expect.arrayContaining(['The Dark Knight', 'The Dark Knight Rises']));
    titles.forEach((t) => expect(t.toLowerCase()).toContain('dark'));
  });

  it('filters by genre in the database query', async () => {
    const res = await request(app).get('/api/movies?genre=animation&limit=48');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(8);
    res.body.data.forEach((m) => expect(m.genres).toContain('Animation'));
  });

  it('combines year and rating filters with sorting and pagination', async () => {
    const res = await request(app).get('/api/movies?yearFrom=2010&yearTo=2019&minRating=8.5&sort=year&order=asc&limit=3&page=1');
    expect(res.status).toBe(200);
    const years = res.body.data.map((m) => m.releaseYear);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    res.body.data.forEach((m) => {
      expect(m.releaseYear).toBeGreaterThanOrEqual(2010);
      expect(m.releaseYear).toBeLessThanOrEqual(2019);
      expect(m.rating).toBeGreaterThanOrEqual(8.5);
    });
    const page2 = await request(app).get('/api/movies?yearFrom=2010&yearTo=2019&minRating=8.5&sort=year&order=asc&limit=3&page=2');
    const overlap = page2.body.data.filter((m) => res.body.data.some((x) => x.movieId === m.movieId));
    expect(overlap).toHaveLength(0);
  });

  it('returns full details with cast in billing order and directors', async () => {
    const res = await request(app).get('/api/movies/inception-2010');
    expect(res.status).toBe(200);
    expect(res.body.data.directors.map((d) => d.name)).toEqual(['Christopher Nolan']);
    expect(res.body.data.cast[0].name).toBe('Leonardo DiCaprio');
    expect(res.body.data.userState).toBeNull();
  });

  it('explains related movies with shared graph nodes', async () => {
    const res = await request(app).get('/api/movies/inception-2010/related?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    res.body.data.forEach((m) => {
      expect(m.movieId).not.toBe('inception-2010');
      expect(m.reasons.length).toBeGreaterThan(0);
    });
    const scores = res.body.data.map((m) => m.relatedScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('returns a movie neighbourhood graph built from database relationships', async () => {
    const res = await request(app).get('/api/graph/movie/inception-2010');
    expect(res.status).toBe(200);
    const ids = new Set(res.body.data.nodes.map((n) => n.data.id));
    expect(ids.has('director:christopher-nolan')).toBe(true);
    expect(ids.has('genre:sci-fi')).toBe(true);
    res.body.data.edges.forEach((e) => {
      expect(ids.has(e.data.source)).toBe(true);
      expect(ids.has(e.data.target)).toBe(true);
    });
  });

  it('computes analytics from the graph', async () => {
    const res = await request(app).get('/api/analytics/overview');
    expect(res.body.data).toMatchObject({ movies: 80, genres: 15, actors: 178, directors: 41 });
  });
});
