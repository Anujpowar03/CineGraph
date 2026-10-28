/**
 * Poster helpers. When a movie has a TMDB posterPath (only after the optional
 * `npm run tmdb:sync`), the image is loaded from TMDB's CDN. Otherwise the UI
 * draws deterministic artwork from the movie id, so no copyrighted images are
 * bundled with the project.
 */
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function tmdbImage(path, size = 'w500') {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${TMDB_IMAGE_BASE}/${size}${path}`;
  return null;
}

/** Small, stable string hash (FNV-1a). */
export function hashString(text = '') {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministic colours and node layout for a generated poster. */
export function posterTheme(seed) {
  const h = hashString(seed);
  const hue = h % 360;
  const hue2 = (hue + 40 + ((h >> 9) % 80)) % 360;
  const rand = (n) => ((h >> n) & 0xff) / 255;
  const nodes = Array.from({ length: 5 }, (_, i) => ({
    x: 18 + rand(i * 3) * 64,
    y: 12 + rand(i * 3 + 5) * 46,
    r: 1.6 + rand(i * 2 + 1) * 2.4,
  }));
  return {
    from: `hsl(${hue} 55% 22%)`,
    via: `hsl(${hue2} 50% 14%)`,
    glow: `hsl(${hue} 85% 65%)`,
    accent: `hsl(${hue2} 80% 70%)`,
    nodes,
  };
}
