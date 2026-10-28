import { env } from '../config/env.js';
import { authCookieOptions, signToken } from '../middleware/auth.js';
import * as auth from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

function startSession(res, user) {
  res.cookie(env.cookie.name, signToken(user.userId), authCookieOptions());
}

export async function register(req, res) {
  const user = await auth.register(req.body);
  startSession(res, user);
  sendSuccess(res, { user }, { status: 201 });
}

export async function login(req, res) {
  const user = await auth.login(req.body);
  startSession(res, user);
  sendSuccess(res, { user });
}

export function logout(req, res) {
  const { maxAge, ...options } = authCookieOptions();
  res.clearCookie(env.cookie.name, options);
  sendSuccess(res, { loggedOut: true });
}

/** Like /me but never 401: returns { user: null } for anonymous visitors. */
export async function session(req, res) {
  const user = req.auth ? await auth.findUser(req.auth.userId) : null;
  sendSuccess(res, { user });
}

export async function me(req, res) {
  const user = await auth.currentUser(req.auth.userId);
  sendSuccess(res, { user });
}
