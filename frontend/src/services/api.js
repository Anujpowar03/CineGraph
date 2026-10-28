import axios from 'axios';

/**
 * Single Axios instance for the CineGraph API.
 * - withCredentials sends the httpOnly session cookie (the token is never
 *   readable from JavaScript).
 * - X-CineGraph-Client is required by the API on state-changing requests
 *   (CSRF protection).
 * - Responses are unwrapped to the { success, data, meta } body; errors are
 *   normalised to an Error with a user-friendly message.
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'X-CineGraph-Client': 'web' },
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const body = error.response?.data;
    let message = body?.error?.message;
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'The request timed out. Please try again.';
      else if (!error.response) message = 'Cannot reach the CineGraph API. Is the backend running on port 5000?';
      else message = 'Something went wrong. Please try again.';
    }
    const normalised = new Error(message);
    normalised.status = error.response?.status ?? 0;
    normalised.code = body?.error?.code ?? 'NETWORK_ERROR';
    normalised.details = body?.error?.details ?? [];
    return Promise.reject(normalised);
  },
);

const listParams = (params = {}) => {
  const clean = { ...params };
  if (Array.isArray(clean.genre)) clean.genre = clean.genre.join(',');
  Object.keys(clean).forEach((k) => (clean[k] === '' || clean[k] == null || clean[k].length === 0) && delete clean[k]);
  return clean;
};

export const authApi = {
  me: () => http.get('/auth/me'),
  session: () => http.get('/auth/session'),
  login: (email, password) => http.post('/auth/login', { email, password }),
  register: (payload) => http.post('/auth/register', payload),
  logout: () => http.post('/auth/logout'),
};

export const moviesApi = {
  list: (params) => http.get('/movies', { params: listParams(params) }),
  search: (q, limit = 8) => http.get('/movies/search', { params: { q, limit } }),
  trending: (limit = 10) => http.get('/movies/trending', { params: { limit } }),
  meta: () => http.get('/movies/meta'),
  get: (movieId) => http.get(`/movies/${encodeURIComponent(movieId)}`),
  related: (movieId, limit = 8) => http.get(`/movies/${encodeURIComponent(movieId)}/related`, { params: { limit } }),
  genres: () => http.get('/genres'),
};

const me = '/users/me';
export const userApi = {
  profile: () => http.get(`${me}/profile`),
  like: (movieId) => http.post(`${me}/likes/${encodeURIComponent(movieId)}`),
  unlike: (movieId) => http.delete(`${me}/likes/${encodeURIComponent(movieId)}`),
  rate: (movieId, rating) => http.post(`${me}/ratings/${encodeURIComponent(movieId)}`, { rating }),
  removeRating: (movieId) => http.delete(`${me}/ratings/${encodeURIComponent(movieId)}`),
  watch: (movieId) => http.post(`${me}/watch-history/${encodeURIComponent(movieId)}`),
  favorites: (limit = 100) => http.get(`${me}/favorites`, { params: { limit } }),
  history: (limit = 50) => http.get(`${me}/history`, { params: { limit } }),
  ratings: (limit = 50) => http.get(`${me}/ratings`, { params: { limit } }),
  preferences: () => http.get(`${me}/preferences`),
  savePreferences: (genreIds) => http.put(`${me}/preferences`, { genreIds }),
};

export const recommendationApi = {
  get: (strategy = 'hybrid', limit = 12) =>
    http.get(strategy === 'hybrid' ? '/recommendations/me' : `/recommendations/me/${strategy}`, { params: { limit } }),
  similarUsers: () => http.get('/recommendations/me/similar-users'),
};

export const graphApi = {
  movie: (movieId, params) => http.get(`/graph/movie/${encodeURIComponent(movieId)}`, { params }),
  neighbourhood: (type, id, params) =>
    http.get(`/graph/neighborhood/${type}/${encodeURIComponent(id)}`, { params }),
};

export const analyticsApi = {
  overview: () => http.get('/analytics/overview'),
  genres: () => http.get('/analytics/genres'),
  topMovies: (limit = 8) => http.get('/analytics/top-movies', { params: { limit } }),
  ratingDistribution: () => http.get('/analytics/rating-distribution'),
  people: (limit = 8) => http.get('/analytics/people', { params: { limit } }),
  decades: () => http.get('/analytics/decades'),
};

export const healthApi = { check: () => http.get('/health') };
