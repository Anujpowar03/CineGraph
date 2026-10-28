import { afterAll, describe, expect, it } from 'vitest';
import { closeDriver } from '../../src/config/neo4j.js';
import { CLIENT, cypher, newUser } from './helpers.js';

afterAll(() => closeDriver());

describe('user interactions', () => {
  it('likes and unlikes a movie without creating duplicates', async () => {
    const { agent, user } = await newUser();
    expect((await agent.post('/api/users/me/likes/arrival-2016').set(CLIENT)).status).toBe(201);
    expect((await agent.post('/api/users/me/likes/arrival-2016').set(CLIENT)).status).toBe(201); // repeat is harmless
    const [{ likes }] = await cypher(
      'MATCH (:User {userId: $userId})-[l:LIKED]->(:Movie {movieId: "arrival-2016"}) RETURN count(l) AS likes',
      { userId: user.userId },
    );
    expect(likes).toBe(1);

    const favorites = await agent.get('/api/users/me/favorites');
    expect(favorites.body.data.map((m) => m.movieId)).toEqual(['arrival-2016']);

    const unlike = await agent.delete('/api/users/me/likes/arrival-2016').set(CLIENT);
    expect(unlike.body.data.removed).toBe(true);
    expect((await agent.get('/api/users/me/favorites')).body.data).toEqual([]);
  });

  it('upserts ratings and rejects out-of-range values', async () => {
    const { agent, user } = await newUser();
    expect((await agent.post('/api/users/me/ratings/alien-1979').set(CLIENT).send({ rating: 3 })).status).toBe(200);
    expect((await agent.post('/api/users/me/ratings/alien-1979').set(CLIENT).send({ rating: 5 })).status).toBe(200);
    expect((await agent.post('/api/users/me/ratings/alien-1979').set(CLIENT).send({ rating: 9 })).status).toBe(400);
    const rows = await cypher('MATCH (:User {userId: $userId})-[r:RATED]->(:Movie) RETURN r.rating AS rating', {
      userId: user.userId,
    });
    expect(rows).toEqual([{ rating: 5 }]);
  });

  it('records watch history and increments the watch count', async () => {
    const { agent } = await newUser();
    await agent.post('/api/users/me/watch-history/up-2009').set(CLIENT);
    const second = await agent.post('/api/users/me/watch-history/up-2009').set(CLIENT);
    expect(second.body.data.watchCount).toBe(2);
    const history = await agent.get('/api/users/me/history');
    expect(history.body.data).toHaveLength(1);
  });

  it('returns 404 for interactions with unknown movies', async () => {
    const { agent } = await newUser();
    expect((await agent.post('/api/users/me/likes/not-a-movie-1900').set(CLIENT)).status).toBe(404);
  });

  it('replaces preferred genres and rejects unknown genre ids', async () => {
    const { agent } = await newUser();
    const ok = await agent.put('/api/users/me/preferences').set(CLIENT).send({ genreIds: ['horror', 'comedy'] });
    expect(ok.body.data.map((g) => g.genreId)).toEqual(['comedy', 'horror']);
    const replaced = await agent.put('/api/users/me/preferences').set(CLIENT).send({ genreIds: ['war'] });
    expect(replaced.body.data.map((g) => g.genreId)).toEqual(['war']);
    expect((await agent.put('/api/users/me/preferences').set(CLIENT).send({ genreIds: ['not-a-genre'] })).status).toBe(400);
  });

  it('shows the signed-in user state on the movie page', async () => {
    const { agent } = await newUser();
    await agent.post('/api/users/me/likes/heat-1995').set(CLIENT);
    await agent.post('/api/users/me/ratings/heat-1995').set(CLIENT).send({ rating: 4 });
    const res = await agent.get('/api/movies/heat-1995');
    expect(res.body.data.userState).toMatchObject({ liked: true, rating: 4 });
  });
});
