import { matchedData } from 'express-validator';
import * as recommendations from '../services/recommendationService.js';
import { sendSuccess } from '../utils/response.js';

/** Factory: one handler per strategy (hybrid, genre, people, collaborative). */
export const recommend = (strategy) => async (req, res) => {
  const { limit } = matchedData(req, { locations: ['query'] });
  sendSuccess(res, await recommendations.recommendForUser(req.params.userId, { strategy, limit }));
};

export async function similarUsers(req, res) {
  sendSuccess(res, await recommendations.similarUsersFor(req.params.userId));
}
