import { afterAll, describe, expect, it } from 'vitest';
import { closeDriver, readQuery, verifyConnection } from '../../src/config/neo4j.js';
import { seedDatabase } from '../../src/scripts/seedDatabase.js';

afterAll(() => closeDriver());

describe('Neo4j connectivity and seeding', () => {
  it('connects to the configured database', async () => {
    const info = await verifyConnection();
    expect(info.agent).toMatch(/^Neo4j\//);
  });

  it('is idempotent: a second seed run creates no nodes or relationships', async () => {
    const summary = await seedDatabase({ log: () => {} });
    expect(summary.nodesCreated).toBe(0);
    expect(summary.relationshipsCreated).toBe(0);
    expect(summary.graph.movies).toBe(80);
    expect(summary.graph.genres).toBe(15);
  });

  it('has no duplicate movies, people or interaction relationships', async () => {
    const [dupes] = await readQuery(`
      RETURN
        COUNT { MATCH (m:Movie) WITH m.movieId AS id, count(*) AS c WHERE c > 1 RETURN id } AS movies,
        COUNT { MATCH (a:Actor) WITH a.actorId AS id, count(*) AS c WHERE c > 1 RETURN id } AS actors,
        COUNT { MATCH (u:User)-[r:RATED]->(m:Movie) WITH u, m, count(r) AS c WHERE c > 1 RETURN u } AS ratings,
        COUNT { MATCH (u:User)-[r:LIKED]->(m:Movie) WITH u, m, count(r) AS c WHERE c > 1 RETURN u } AS likes
    `);
    expect(dupes).toEqual({ movies: 0, actors: 0, ratings: 0, likes: 0 });
  });

  it('created the uniqueness constraints', async () => {
    const rows = await readQuery("SHOW CONSTRAINTS YIELD name WHERE name ENDS WITH '_unique' RETURN collect(name) AS names");
    expect(rows[0].names).toEqual(
      expect.arrayContaining(['movie_id_unique', 'user_email_unique', 'genre_id_unique', 'actor_id_unique']),
    );
  });
});
