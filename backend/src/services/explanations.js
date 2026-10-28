/**
 * Builds human-readable explanations from query results.
 *
 * Rule: every sentence produced here must be backed by data that a Cypher
 * query actually returned (shared genre names, shared people with the seed
 * movies they connect through, similar-user counts). Nothing is guessed.
 */

export function joinNames(names) {
  const list = [...names];
  if (list.length <= 1) return list.join('');
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

const plural = (count, singular, pluralForm = `${singular}s`) => (count === 1 ? singular : pluralForm);

/** "you liked Inception" / "you rated Arrival 5★" */
export function describeSeed(seed) {
  if (!seed) return '';
  return seed.liked ? `you liked ${seed.title}` : `you rated ${seed.title} ${seed.rating}★`;
}

/**
 * Choose the seed movie that is most strongly connected to the candidate.
 * Director links count 3, each shared actor 2, each shared genre 1.
 */
export function pickAnchor({ seedOverlaps = [], actors = [], directors = [] }) {
  const scores = new Map();
  const add = (title, points) => scores.set(title, (scores.get(title) || 0) + points);
  directors.forEach((d) => d.via.forEach((title) => add(title, 3)));
  actors.forEach((a) => a.via.forEach((title) => add(title, 2)));
  seedOverlaps.forEach((s) => add(s.title, s.genres.length));
  let best = null;
  for (const [title, points] of scores) {
    if (!best || points > best.points || (points === best.points && title < best.title)) {
      best = { title, points };
    }
  }
  return best?.title ?? null;
}

/** What exactly the candidate shares with one specific seed movie. */
export function sharedWithAnchor(anchorTitle, { seedOverlaps = [], actors = [], directors = [] }) {
  return {
    genres: seedOverlaps.find((s) => s.title === anchorTitle)?.genres ?? [],
    actors: actors.filter((a) => a.via.includes(anchorTitle)).map((a) => a.name),
    directors: directors.filter((d) => d.via.includes(anchorTitle)).map((d) => d.name),
  };
}

function describeShared({ genres, actors, directors }) {
  const parts = [];
  if (directors.length) parts.push(`${plural(directors.length, 'director')} ${joinNames(directors)}`);
  if (actors.length) parts.push(`${plural(actors.length, 'actor')} ${joinNames(actors)}`);
  if (genres.length) parts.push(`the ${joinNames(genres)} ${plural(genres.length, 'genre')}`);
  return joinNames(parts);
}

/**
 * @param {object} input
 * @param {object} input.movie            { title, rating }
 * @param {string[]} input.sharedGenres   profile genres the movie belongs to
 * @param {string[]} input.preferredGenreNames  genres the user explicitly prefers
 * @param {Array}  input.seedOverlaps     [{ title, genres }] seeds sharing genres
 * @param {Array}  input.actors           [{ name, via: [seed titles] }]
 * @param {Array}  input.directors        [{ name, via: [seed titles] }]
 * @param {number} input.similarUserCount similar users who endorsed the movie
 * @param {Map}    input.seedsByTitle     title -> { title, liked, rating }
 * @param {string} input.mode             'personalised' | 'preference-based' | 'popular'
 */
export function buildExplanation({
  movie,
  sharedGenres = [],
  preferredGenreNames = [],
  seedOverlaps = [],
  actors = [],
  directors = [],
  similarUserCount = 0,
  seedsByTitle = new Map(),
  mode = 'personalised',
  engagedUsers = 0,
}) {
  const reasons = [];

  if (mode === 'popular') {
    const headline =
      engagedUsers > 0
        ? `Popular on CineGraph: ${engagedUsers} ${plural(engagedUsers, 'user')} engaged with this movie.`
        : 'Highly rated in the CineGraph catalogue.';
    reasons.push('Not personalised yet: like, rate or pick preferred genres to get tailored picks.');
    if (movie.rating >= 8) reasons.push(`Catalogue rating ${movie.rating.toFixed(1)}/10`);
    return { headline, reasons, anchorMovie: null };
  }

  const anchorTitle = pickAnchor({ seedOverlaps, actors, directors });
  let headline;
  if (anchorTitle) {
    const shared = sharedWithAnchor(anchorTitle, { seedOverlaps, actors, directors });
    const seedText = describeSeed(seedsByTitle.get(anchorTitle)) || `you enjoyed ${anchorTitle}`;
    headline = `Recommended because ${seedText}: it shares ${describeShared(shared)}.`;
  } else if (similarUserCount > 0) {
    headline = `Liked by ${similarUserCount} ${plural(similarUserCount, 'user')} whose taste overlaps with yours.`;
  } else {
    const preferred = sharedGenres.filter((g) => preferredGenreNames.includes(g));
    headline = preferred.length
      ? `Matches your preferred ${plural(preferred.length, 'genre')}: ${joinNames(preferred)}.`
      : `Shares the ${joinNames(sharedGenres)} ${plural(sharedGenres.length, 'genre')} with your taste profile.`;
  }

  directors.forEach((d) => reasons.push(`Directed by ${d.name}, who also directed ${joinNames(d.via)}`));
  actors.slice(0, 3).forEach((a) => reasons.push(`Stars ${a.name}, also in ${joinNames(a.via)}`));
  const seedGenres = sharedGenres.filter((g) => seedOverlaps.some((s) => s.genres.includes(g)));
  if (seedGenres.length) {
    reasons.push(`Shares ${joinNames(seedGenres)} with movies you liked or rated highly`);
  }
  const preferred = sharedGenres.filter((g) => preferredGenreNames.includes(g));
  if (preferred.length) reasons.push(`In your preferred ${plural(preferred.length, 'genre')}: ${joinNames(preferred)}`);
  if (similarUserCount > 0) {
    reasons.push(
      `Liked or rated 4★+ by ${similarUserCount} ${plural(similarUserCount, 'user')} with similar taste`,
    );
  }
  if (movie.rating >= 8) reasons.push(`Catalogue rating ${movie.rating.toFixed(1)}/10`);
  if (mode === 'preference-based') {
    reasons.push('Based on your chosen genres - like or rate a few movies to unlock deeper recommendations.');
  }

  return { headline, reasons, anchorMovie: anchorTitle };
}
