import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDriver } from '../../src/config/neo4j.js';
import { CLIENT, cypher, loginAs, newUser } from './helpers.js';

afterAll(() => closeDriver());

let aarav;
let consumed;
beforeAll(async () => {
  aarav = await loginAs('aarav@cinegraph.demo');
  const rows = await cypher(
    'MATCH (:User {userId: "user-aarav"})-[:LIKED|RATED|WATCHED]->(m:Movie) RETURN collect(DISTINCT m.movieId) AS ids',
  );
  consumed = new Set(rows[0].ids);
});

describe('genre-based recommendations (Algorithm A)', () => {
  it('only returns unseen movies that share a genre with the taste profile', async () => {
    const res = await aarav.get('/api/recommendations/me/genre?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(10);
    for (const item of res.body.data.items) {
      expect(consumed.has(item.movieId)).toBe(false);
      expect(item.sharedGenres.length).toBeGreaterThan(0);
      item.sharedGenres.forEach((g) => expect(item.genres).toContain(g));
    }
  });
});

describe('actor/director recommendations (Algorithm B)', () => {
  it('every shared person really connects the candidate to a seed movie', async () => {
    const res = await aarav.get('/api/recommendations/me/people?limit=8');
    expect(res.body.data.items.length).toBeGreaterThan(0);
    for (const item of res.body.data.items) {
      for (const person of [...item.sharedActors, ...item.sharedDirectors]) {
        const [{ ok }] = await cypher(
          `MATCH (p {name: $name})-[:ACTED_IN|DIRECTED]->(c:Movie {movieId: $movieId})
           RETURN EXISTS { MATCH (p)-[:ACTED_IN|DIRECTED]->(s:Movie) WHERE s.title IN $via } AS ok`,
          { name: person.name, movieId: item.movieId, via: person.via },
        );
        expect(ok).toBe(true);
      }
    }
  });
});

describe('collaborative filtering (Algorithm C)', () => {
  it('finds Priya as the most similar user to Aarav', async () => {
    const res = await aarav.get('/api/recommendations/me/similar-users');
    expect(res.body.data[0].name).toBe('Priya Nair');
    expect(res.body.data[0].sharedTitles).toEqual(expect.arrayContaining(['Inception', 'Interstellar']));
  });

  it('recommends movies endorsed by similar users and excludes consumed ones', async () => {
    const res = await aarav.get('/api/recommendations/me/collaborative');
    const ids = res.body.data.items.map((i) => i.movieId);
    expect(ids).toEqual(expect.arrayContaining(['dune-2021', 'the-martian-2015']));
    res.body.data.items.forEach((i) => {
      expect(i.similarUserCount).toBeGreaterThan(0);
      expect(consumed.has(i.movieId)).toBe(false);
    });
  });
});

describe('hybrid recommendations (Algorithm D)', () => {
  it('is ranked by finalScore with all component scores in 0..1', async () => {
    const res = await aarav.get('/api/recommendations/me?limit=15');
    const items = res.body.data.items;
    expect(res.body.data.mode).toBe('personalised');
    const scores = items.map((i) => i.finalScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    items.forEach((item) => {
      Object.values(item.components).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
      expect(consumed.has(item.movieId)).toBe(false);
      expect(item.headline.length).toBeGreaterThan(10);
    });
  });

  it('names a director in the explanation only when the director is really shared', async () => {
    const res = await aarav.get('/api/recommendations/me?limit=15');
    for (const item of res.body.data.items) {
      for (const director of item.sharedDirectors) {
        const [{ count }] = await cypher(
          'MATCH (d:Director {name: $name})-[:DIRECTED]->(m:Movie {movieId: $movieId}) RETURN count(*) AS count',
          { name: director.name, movieId: item.movieId },
        );
        expect(count).toBe(1);
      }
    }
  });

  it('rejects requests for another user', async () => {
    expect((await aarav.get('/api/recommendations/user-priya')).status).toBe(403);
  });
});

describe('cold start and changing behaviour', () => {
  it('gives a new user labelled popular picks, then preference-based, then personalised results', async () => {
    const { agent } = await newUser();

    const empty = await agent.get('/api/recommendations/me');
    expect(empty.body.data.mode).toBe('popular');
    expect(empty.body.data.items.length).toBeGreaterThan(0);

    const collaborative = await agent.get('/api/recommendations/me/collaborative');
    expect(collaborative.status).toBe(200);
    expect(collaborative.body.data.items).toEqual([]);
    expect(collaborative.body.data.message).toBeTruthy();

    await agent.put('/api/users/me/preferences').set(CLIENT).send({ genreIds: ['animation'] });
    const preference = await agent.get('/api/recommendations/me?limit=5');
    expect(preference.body.data.mode).toBe('preference-based');
    preference.body.data.items.forEach((i) => expect(i.genres).toContain('Animation'));

    await agent.post('/api/users/me/likes/toy-story-1995').set(CLIENT);
    const personalised = await agent.get('/api/recommendations/me?limit=10');
    expect(personalised.body.data.mode).toBe('personalised');
    const ids = personalised.body.data.items.map((i) => i.movieId);
    expect(ids).not.toContain('toy-story-1995'); // liked movies are excluded
    expect(personalised.body.data.similarUsers.map((u) => u.name)).toContain('Sneha Iyer');
  });
});
