import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import * as users from '../repositories/userRepository.js';
import { ApiError } from '../utils/ApiError.js';

const BCRYPT_ROUNDS = 12;
// Compared against when an e-mail is unknown, so a failed login takes the same
// time whether or not the account exists (prevents account enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync('cinegraph-timing-equaliser', BCRYPT_ROUNDS);

export const normaliseEmail = (email) => email.trim().toLowerCase();

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    return await users.createUser({
      userId: randomUUID(),
      name: name.trim(),
      email: normaliseEmail(email),
      passwordHash,
    });
  } catch (error) {
    if (error?.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
      throw ApiError.conflict('Unable to create an account with these details. If you already have an account, please sign in.');
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const credentials = await users.findCredentialsByEmail(normaliseEmail(email));
  const valid = await bcrypt.compare(password, credentials?.passwordHash ?? DUMMY_HASH);
  if (!credentials || !valid) throw ApiError.unauthorized('Invalid email or password');
  return users.findUserById(credentials.userId);
}

export const findUser = (userId) => users.findUserById(userId);

export async function currentUser(userId) {
  const user = await users.findUserById(userId);
  if (!user) throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
  return user;
}
