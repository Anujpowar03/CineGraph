import request from 'supertest';
import { createApp } from '../../src/app.js';
import { readQuery } from '../../src/config/neo4j.js';

export const app = createApp();
export const CLIENT = { 'X-CineGraph-Client': 'web' };

/** A supertest agent that keeps the session cookie between requests. */
export async function loginAs(email, password = 'Demo@1234') {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').set(CLIENT).send({ email, password });
  if (res.status !== 200) throw new Error(`Login failed for ${email}: ${res.status}`);
  return agent;
}

let counter = 0;
/** Registers a brand-new user (cleaned up by globalSetup teardown). */
export async function newUser() {
  counter += 1;
  const agent = request.agent(app);
  const email = `user${Date.now()}${counter}@test.cinegraph`;
  const res = await agent.post('/api/auth/register').set(CLIENT).send({ name: 'Test User', email, password: 'Testing123' });
  if (res.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.data.user };
}

export const cypher = (query, params) => readQuery(query, params);
