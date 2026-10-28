import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Replace the database layer: these tests check HTTP behaviour only.
vi.mock('../../src/config/neo4j.js', () => ({
  readQuery: vi.fn(),
  writeQuery: vi.fn(),
  writeQueryWithSummary: vi.fn(),
  verifyConnection: vi.fn(),
  closeDriver: vi.fn(),
  describeConnectionError: vi.fn(() => 'mock'),
}));

const neo4j = await import('../../src/config/neo4j.js');
const { createApp } = await import('../../src/app.js');
const { signToken } = await import('../../src/middleware/auth.js');

const app = createApp();
const CLIENT = { 'X-CineGraph-Client': 'web' };
const cookieFor = (userId) => `cinegraph_token=${signToken(userId)}`;
const dbDown = () => Object.assign(new Error('connect ECONNREFUSED'), { code: 'ServiceUnavailable' });

beforeEach(() => {
  vi.mocked(neo4j.readQuery).mockReset();
  vi.mocked(neo4j.writeQuery).mockReset();
  vi.mocked(neo4j.verifyConnection).mockReset();
});

describe('input validation', () => {
  it('rejects an unknown sort option without querying the database', async () => {
    const res = await request(app).get('/api/movies?sort=popularity;DROP');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.details[0].field).toBe('sort');
    expect(neo4j.readQuery).not.toHaveBeenCalled();
  });

  it('rejects an inverted year range and out-of-range ratings', async () => {
    expect((await request(app).get('/api/movies?yearFrom=2020&yearTo=2000')).status).toBe(400);
    expect((await request(app).get('/api/movies?minRating=11')).status).toBe(400);
    expect((await request(app).get('/api/movies?limit=500')).status).toBe(400);
  });

  it('rejects malformed movie ids and empty searches', async () => {
    expect((await request(app).get('/api/movies/Bad_ID!')).status).toBe(400);
    expect((await request(app).get('/api/movies/search')).status).toBe(400);
  });

  it.each([0, 6, 4.5, 'five', null])('rejects rating value %s', async (rating) => {
    const res = await request(app)
      .post('/api/users/me/ratings/inception-2010')
      .set(CLIENT)
      .set('Cookie', cookieFor('user-1'))
      .send({ rating });
    expect(res.status).toBe(400);
    expect(neo4j.writeQuery).not.toHaveBeenCalled();
  });

  it('accepts a valid rating and stores it for the authenticated user', async () => {
    vi.mocked(neo4j.writeQuery).mockResolvedValue([{ movieId: 'inception-2010', rating: 5, ratedAt: 'now' }]);
    const res = await request(app)
      .post('/api/users/me/ratings/inception-2010')
      .set(CLIENT)
      .set('Cookie', cookieFor('user-1'))
      .send({ rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
    const [, params] = vi.mocked(neo4j.writeQuery).mock.calls[0];
    expect(params).toEqual({ userId: 'user-1', movieId: 'inception-2010', rating: 5 });
  });

  it('validates registration input', async () => {
    const weak = await request(app).post('/api/auth/register').set(CLIENT).send({ name: 'A', email: 'nope', password: 'short' });
    expect(weak.status).toBe(400);
    const fields = weak.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('validates preference updates', async () => {
    const res = await request(app)
      .put('/api/users/me/preferences')
      .set(CLIENT)
      .set('Cookie', cookieFor('user-1'))
      .send({ genreIds: 'sci-fi' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for malformed JSON bodies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set(CLIENT)
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });
});

describe('authentication and authorisation', () => {
  it('requires a session for protected routes', async () => {
    const res = await request(app).post('/api/users/me/likes/inception-2010').set(CLIENT);
    expect(res.status).toBe(401);
  });

  it('reports an anonymous session as user: null instead of an error', async () => {
    const res = await request(app).get('/api/auth/session');
    expect(res.status).toBe(200);
    expect(res.body.data.user).toBeNull();
  });

  it('ignores forged or tampered tokens', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'cinegraph_token=not-a-real-token');
    expect(res.status).toBe(401);
  });

  it("never lets a user act on another user's id", async () => {
    const res = await request(app).get('/api/recommendations/user-2').set('Cookie', cookieFor('user-1'));
    expect(res.status).toBe(403);
    const like = await request(app).post('/api/users/user-2/likes/inception-2010').set(CLIENT).set('Cookie', cookieFor('user-1'));
    expect(like.status).toBe(403);
    expect(neo4j.writeQuery).not.toHaveBeenCalled();
  });

  it('blocks state-changing requests without the client header (CSRF defence)', async () => {
    const res = await request(app).post('/api/users/me/likes/inception-2010').set('Cookie', cookieFor('user-1'));
    expect(res.status).toBe(403);
  });

  it('uses the same generic message for unknown e-mail and wrong password', async () => {
    vi.mocked(neo4j.readQuery).mockResolvedValueOnce([]);
    const unknown = await request(app).post('/api/auth/login').set(CLIENT).send({ email: 'x@y.com', password: 'whatever1' });

    const passwordHash = await bcrypt.hash('CorrectHorse1', 4);
    vi.mocked(neo4j.readQuery).mockResolvedValueOnce([{ userId: 'user-1', passwordHash }]);
    const wrong = await request(app).post('/api/auth/login').set(CLIENT).send({ email: 'x@y.com', password: 'whatever1' });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it('sets an httpOnly session cookie and never returns the password hash', async () => {
    const passwordHash = await bcrypt.hash('CorrectHorse1', 4);
    vi.mocked(neo4j.readQuery)
      .mockResolvedValueOnce([{ userId: 'user-1', passwordHash }])
      .mockResolvedValueOnce([{ user: { userId: 'user-1', name: 'Test', email: 'x@y.com', createdAt: 'now' } }]);
    const res = await request(app).post('/api/auth/login').set(CLIENT).send({ email: 'X@Y.com', password: 'CorrectHorse1' });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/cinegraph_token=.+; .*HttpOnly/);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    // e-mail is normalised before lookup
    expect(vi.mocked(neo4j.readQuery).mock.calls[0][1]).toEqual({ email: 'x@y.com' });
  });
});

describe('error handling', () => {
  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when a movie does not exist', async () => {
    vi.mocked(neo4j.readQuery).mockResolvedValue([]);
    const res = await request(app).get('/api/movies/no-such-movie');
    expect(res.status).toBe(404);
  });

  it('returns 503 (not a stack trace) when Neo4j is unavailable', async () => {
    vi.mocked(neo4j.readQuery).mockRejectedValue(dbDown());
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('DATABASE_UNAVAILABLE');
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|at .*\.js/);
  });

  it('reports database status on the health endpoint', async () => {
    vi.mocked(neo4j.verifyConnection).mockRejectedValue(dbDown());
    const down = await request(app).get('/api/health');
    expect(down.status).toBe(503);
    expect(down.body.data.database).toBe('unavailable');

    vi.mocked(neo4j.verifyConnection).mockResolvedValue({ agent: 'Neo4j/5.26.0', address: 'x' });
    const up = await request(app).get('/api/health');
    expect(up.status).toBe(200);
    expect(up.body.data.database).toBe('connected');
  });
});

describe('graph privacy', () => {
  it('strips e-mail and password hash from User nodes', async () => {
    const node = (elementId, labels, properties) => ({ elementId, labels, properties });
    vi.mocked(neo4j.readQuery).mockResolvedValue([
      {
        nodes: [
          node('1', ['Movie'], { movieId: 'inception-2010', title: 'Inception', rating: 8.8 }),
          node('2', ['User'], { userId: 'user-9', name: 'Priya Nair', email: 'p@x.com', passwordHash: '$2a$secret' }),
        ],
        relationships: [
          { elementId: 'r1', type: 'LIKED', startNodeElementId: '2', endNodeElementId: '1', properties: {} },
        ],
      },
    ]);
    const res = await request(app).get('/api/graph/movie/inception-2010');
    expect(res.status).toBe(200);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('p@x.com');
    expect(text).not.toContain('passwordHash');
    const user = res.body.data.nodes.find((n) => n.data.type === 'user');
    expect(user.data.label).toBe('Priya N.');
    expect(res.body.data.edges[0].data).toMatchObject({ source: 'user:user-9', target: 'movie:inception-2010', label: 'LIKED' });
  });

  it("refuses to expand another user's node", async () => {
    const res = await request(app).get('/api/graph/neighborhood/user/user-2').set('Cookie', cookieFor('user-1'));
    expect(res.status).toBe(403);
  });
});
