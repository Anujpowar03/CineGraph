import { matchedData } from 'express-validator';
import * as graph from '../services/graphService.js';
import { sendSuccess } from '../utils/response.js';

export async function movieGraph(req, res) {
  const { movieId, relatedLimit, userLimit } = matchedData(req);
  sendSuccess(res, await graph.getMovieGraph(movieId, { relatedLimit, userLimit, viewerId: req.auth?.userId }));
}

export async function neighbourhood(req, res) {
  const { type, id, offset, limit } = matchedData(req);
  sendSuccess(res, await graph.getNeighbourhood(type, id, { offset, limit, viewerId: req.auth?.userId }));
}
