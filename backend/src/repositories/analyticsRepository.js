import { readQuery } from '../config/neo4j.js';
import {
  GENRE_STATS,
  MOST_CONNECTED_PEOPLE,
  MOVIES_PER_DECADE,
  OVERVIEW,
  RATING_DISTRIBUTION,
  TOP_COMMUNITY_RATED,
  TOP_RATED,
} from '../queries/analyticsQueries.js';

export async function overview() {
  const [row] = await readQuery(OVERVIEW);
  return row;
}

export const genreStats = () => readQuery(GENRE_STATS);
export const topRated = (limit) => readQuery(TOP_RATED, { limit });
export const topCommunityRated = (limit, minRatings) => readQuery(TOP_COMMUNITY_RATED, { limit, minRatings });
export const ratingDistribution = () => readQuery(RATING_DISTRIBUTION);
export const mostConnectedPeople = (limit) => readQuery(MOST_CONNECTED_PEOPLE, { limit });
export const moviesPerDecade = () => readQuery(MOVIES_PER_DECADE);
