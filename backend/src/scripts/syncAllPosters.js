import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOVIES } from '../data/movies.js';
import { closeDriver, verifyConnection, writeQuery } from '../config/neo4j.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIRECT_SLUGS = {
  'terminator-2-1991': 'Terminator_2:_Judgment_Day',
  'lotr-fellowship-of-the-ring-2001': 'The_Lord_of_the_Rings:_The_Fellowship_of_the_Ring',
  'lotr-the-two-towers-2002': 'The_Lord_of_the_Rings:_The_Two_Towers',
  'lotr-return-of-the-king-2003': 'The_Lord_of_the_Rings:_The_Return_of_the_King',
  'dunkirk-2017': 'Dunkirk_(2017_film)',
};

async function getPosterForMovie(movie) {
  const headers = { 'User-Agent': 'CineGraphPosterSync/1.0 (contact@cinegraph.local)' };

  if (DIRECT_SLUGS[movie.id]) {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(DIRECT_SLUGS[movie.id])}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const img = data.thumbnail?.source || data.originalimage?.source;
        if (img) return img.split('?')[0];
      }
    } catch (_) {}
  }

  const queries = [
    `${movie.title} ${movie.year} film`,
    `${movie.title} film`,
    movie.title,
  ];

  for (const q of queries) {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json`;
      const sRes = await fetch(searchUrl, { headers });
      const sData = await sRes.json();
      const pageTitle = sData.query?.search?.[0]?.title;
      if (pageTitle) {
        const pRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`, { headers });
        if (pRes.ok) {
          const pData = await pRes.json();
          const img = pData.thumbnail?.source || pData.originalimage?.source;
          if (img) {
            return img.split('?')[0];
          }
        }
      }
    } catch (_) {}
  }

  return null;
}

async function main() {
  console.log('Verifying Neo4j connection...');
  await verifyConnection();
  console.log('Fetching movie poster images for all 80 movies...');

  const posters = {};
  for (let i = 0; i < MOVIES.length; i += 5) {
    const batch = MOVIES.slice(i, i + 5);
    await Promise.all(
      batch.map(async (m) => {
        const url = await getPosterForMovie(m);
        posters[m.id] = url;
        console.log(`  ${url ? '✓' : '✗'} ${m.title} (${m.year}) -> ${url ? 'Found' : 'Missing'}`);
      })
    );
  }

  let updatedCount = 0;
  for (const m of MOVIES) {
    const posterUrl = posters[m.id];
    if (posterUrl) {
      await writeQuery(
        `MATCH (m:Movie {movieId: $movieId})
         SET m.posterPath = $posterPath`,
        { movieId: m.id, posterPath: posterUrl }
      );
      updatedCount += 1;
    }
  }
  console.log(`\nSuccessfully updated ${updatedCount} movies in Neo4j with posters!`);

  // Now update data/movies.js with posterPath so it persists in the repo and on re-seeds
  const moviesFilePath = path.resolve(__dirname, '../data/movies.js');
  let moviesFileContent = await fs.readFile(moviesFilePath, 'utf-8');

  for (const m of MOVIES) {
    const posterUrl = posters[m.id];
    if (posterUrl) {
      // Find the movie object by its id
      const targetPattern = new RegExp(`id:\\s*'${m.id}',`, 'g');
      if (moviesFileContent.match(targetPattern)) {
        moviesFileContent = moviesFileContent.replace(
          targetPattern,
          `id: '${m.id}', posterPath: '${posterUrl}',`
        );
      }
    }
  }

  await fs.writeFile(moviesFilePath, moviesFileContent, 'utf-8');
  console.log(`Updated backend/src/data/movies.js with posterPath metadata.`);
}

main()
  .catch((err) => {
    console.error('Failed to sync posters:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDriver();
  });
