import * as analytics from '../repositories/analyticsRepository.js';
import { round } from './scoring.js';

export const overview = () => analytics.overview();

export async function genres() {
  const rows = await analytics.genreStats();
  return rows.map((r) => ({ ...r, avgRating: r.avgRating === null ? null : round(r.avgRating, 2) }));
}

export async function topMovies(limit) {
  const [catalogue, community] = await Promise.all([
    analytics.topRated(limit),
    analytics.topCommunityRated(limit, 2),
  ]);
  return {
    catalogue: catalogue.map((r) => r.movie),
    community: community.map((r) => ({ ...r.movie, average: round(r.average, 2), ratingCount: r.ratingCount })),
  };
}

/** Always returns all five star levels, including those with zero ratings. */
export async function ratingDistribution() {
  const rows = await analytics.ratingDistribution();
  const counts = new Map(rows.map((r) => [r.stars, r.count]));
  return [1, 2, 3, 4, 5].map((stars) => ({ stars, count: counts.get(stars) ?? 0 }));
}

export const mostConnectedPeople = (limit) => analytics.mostConnectedPeople(limit);
export const moviesPerDecade = () => analytics.moviesPerDecade();
