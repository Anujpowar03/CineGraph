import { pathToFileURL } from 'node:url';
import { closeDriver, describeConnectionError, readQuery, verifyConnection } from '../config/neo4j.js';
import * as repo from '../repositories/recommendationRepository.js';
import { loadProfile, recommendForProfile } from '../services/recommendationService.js';

/**
 * Offline evaluation: Precision@K and Recall@K
 * --------------------------------------------
 * Protocol (time-based hold-out, per user):
 *   1. Take the user's positive movies (liked, or rated >= 4) ordered by the
 *      time of the interaction.
 *   2. Hide the most recent 25% (at least 1) as the TEST set.
 *   3. Build the profile from the remaining TRAINING interactions only. Test
 *      movies are removed from the seeds AND from the "already consumed"
 *      exclusion list, so the engine never sees them.
 *   4. Recommend K movies; a hit is a recommended movie that is in the test set.
 *        Precision@K = hits / K        Recall@K = hits / |test set|
 *   5. Average over all users with at least MIN_POSITIVES positive movies.
 * A popularity ranking (most-engaged movies, excluding the evaluated user's own
 * interactions) is reported as a non-personalised baseline.
 *
 * The sample graph is tiny (a handful of users), so these numbers only show
 * that the procedure works - they are NOT a statistically meaningful benchmark.
 */

const KS = [5, 10];
const HOLDOUT_FRACTION = 0.25;
const MIN_POSITIVES = 4;
const STRATEGIES = ['hybrid', 'genre', 'people', 'collaborative'];

export function splitHoldout(seeds, fraction = HOLDOUT_FRACTION) {
  const ordered = [...seeds].sort(
    (a, b) => String(a.interactedAt).localeCompare(String(b.interactedAt)) || a.movieId.localeCompare(b.movieId),
  );
  const testSize = Math.max(1, Math.round(ordered.length * fraction));
  return {
    train: ordered.slice(0, ordered.length - testSize),
    test: ordered.slice(ordered.length - testSize),
  };
}

export function precisionRecall(recommendedIds, testIds, k) {
  const topK = recommendedIds.slice(0, k);
  const hits = topK.filter((id) => testIds.has(id)).length;
  return { hits, precision: hits / k, recall: testIds.size ? hits / testIds.size : 0 };
}

export async function evaluate({ log = console.log } = {}) {
  const users = await readQuery('MATCH (u:User) RETURN u.userId AS userId, u.name AS name ORDER BY u.userId');
  const maxK = Math.max(...KS);
  const methods = [...STRATEGIES, 'popularity baseline'];
  const totals = Object.fromEntries(methods.map((m) => [m, Object.fromEntries(KS.map((k) => [k, { p: 0, r: 0 }]))]));
  const perUser = [];

  for (const { userId, name } of users) {
    const full = await loadProfile(userId);
    if (full.seeds.length < MIN_POSITIVES) continue;
    const { test } = splitHoldout(full.seeds);
    const testIds = new Set(test.map((s) => s.movieId));
    const profile = await loadProfile(userId, { holdoutIds: [...testIds] });

    const row = { user: name, train: profile.seeds.length, test: test.map((s) => s.title) };
    for (const method of methods) {
      let ids;
      if (method === 'popularity baseline') {
        ids = (await repo.getPopularMovies(userId, profile.consumedIds, maxK)).map((r) => r.movieId);
      } else {
        ids = (await recommendForProfile(profile, { strategy: method, limit: maxK })).items.map((i) => i.movieId);
      }
      for (const k of KS) {
        const { precision, recall, hits } = precisionRecall(ids, testIds, k);
        totals[method][k].p += precision;
        totals[method][k].r += recall;
        if (method === 'hybrid') row[`hybridHits@${k}`] = hits;
      }
    }
    perUser.push(row);
  }

  const n = perUser.length;
  log(`\nEvaluated ${n} users (hold-out = most recent ${HOLDOUT_FRACTION * 100}% of positive interactions)\n`);
  log('Per-user hold-out sets:');
  perUser.forEach((r) => log(`  ${r.user.padEnd(16)} train=${r.train}  test=[${r.test.join(', ')}]  hybrid hits@5=${r['hybridHits@5']} @10=${r['hybridHits@10']}`));
  log('\nMethod                 ' + KS.map((k) => `P@${k}    R@${k}   `).join(''));
  const results = {};
  for (const method of methods) {
    results[method] = Object.fromEntries(
      KS.map((k) => [k, { precision: n ? totals[method][k].p / n : 0, recall: n ? totals[method][k].r / n : 0 }]),
    );
    log(
      `${method.padEnd(22)} ` +
        KS.map((k) => `${results[method][k].precision.toFixed(3)}  ${results[method][k].recall.toFixed(3)}  `).join(''),
    );
  }
  log('\nNote: with so few users these figures are illustrative only, not a benchmark.');
  return { users: n, results, perUser };
}

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  try {
    await verifyConnection();
    await evaluate();
  } catch (error) {
    console.error(`✗ Evaluation failed: ${describeConnectionError(error)}`);
    process.exitCode = 1;
  } finally {
    await closeDriver();
  }
}
