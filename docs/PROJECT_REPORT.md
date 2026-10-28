# CineGraph — Mini Project Report

**Title:** CineGraph — A Graph-Based Movie Recommendation System Using Neo4j
**Tagline:** Discover Movies Through Connections
**Domain:** Databases (graph databases) · Web development · Recommender systems

Setup, API reference and full algorithm details are in the [README](../README.md). This report collects
the material normally needed for a college submission and viva.

---

## 1. Abstract

CineGraph is a web application that recommends movies using the relationships stored in a Neo4j graph
database. Users, movies, genres, actors and directors are nodes; likes, ratings, watch events, genre
preferences, cast and director credits are relationships. Four recommendation strategies run as Cypher
graph traversals: genre-based, actor/director-based, collaborative filtering through users with similar
tastes, and a hybrid that combines normalised scores with configurable weights. Every recommendation
includes an explanation built only from relationships that the query actually found. The system has a
React front end with search, filters, ratings, a recommendation dashboard, an interactive Cytoscape.js
graph explorer and analytics, and a secured Express REST API. It is tested with 53 unit/API tests and 25
integration tests against a real Neo4j instance.

## 2. Problem statement and objectives

**Problem statement.** Build a movie recommender whose suggestions come from the connections between
users, movies, genres and people in a graph database, are explainable, and update immediately when the
user's behaviour changes.

**Objectives**
1. Design a property-graph schema with uniqueness constraints and indexes.
2. Implement genre-based, actor/director-based, collaborative and hybrid recommendations in Cypher.
3. Return a 0–1 relevance score and a truthful explanation with every recommendation.
4. Handle new users (cold start) gracefully.
5. Provide authentication, authorisation and input validation.
6. Build a responsive UI with an interactive graph visualisation and analytics.
7. Verify the system with automated tests and an offline Precision@K / Recall@K evaluation.

## 3. Software and hardware requirements

**Software**

| Component | Requirement |
|---|---|
| Operating system | Windows 10/11, macOS or Linux |
| Runtime | Node.js 18.18+ (tested with 22) and npm |
| Database | Neo4j 5.x (5.26 LTS recommended) / 2025.x, or Neo4j AuraDB Free |
| Browser | Recent Chrome, Edge or Firefox |
| Tools | Visual Studio Code, Git, Postman (optional), Neo4j Browser |
| Front-end libraries | React 18.3, React Router 6.28, Vite 5.4, Tailwind CSS 3.4, Axios 1.7, Recharts 2.15, Cytoscape 3.30, lucide-react 0.468 |
| Back-end libraries | Express 4.21, neo4j-driver 5.28, express-validator 7.2, bcryptjs 2.4, jsonwebtoken 9, helmet 8, cors 2.8, express-rate-limit 7.5, cookie-parser, morgan, dotenv |
| Testing | Vitest 2.1, Supertest 7 |

**Hardware (minimum / recommended)**

| | Minimum | Recommended |
|---|---|---|
| CPU | Dual-core 2 GHz | Quad-core |
| RAM | 4 GB (AuraDB) | 8 GB (local Neo4j Desktop) |
| Disk | 1 GB free | 2 GB free |
| Network | Needed for npm install (and AuraDB, if used) | |

## 4. Architecture explanation

```
 Browser (React SPA)
   │  JSON over HTTP(S), httpOnly session cookie, X-CineGraph-Client header
   ▼
 Express API ── middleware: helmet → CORS → rate limit → CSRF header → JSON → cookies
   │             routes → validators → auth/ownership → controllers
   ▼
 Services (recommendation engine, scoring, explanations, graph serialiser, auth)
   ▼
 Repositories → Cypher query modules
   │  Bolt protocol, parameterised queries, managed transactions
   ▼
 Neo4j graph database
```

- **Presentation layer (frontend/)** — React pages and reusable components. `services/api.js` is the only
  place that talks to the API. `AuthContext` keeps the signed-in user and their liked movie ids.
- **Application layer (backend/src)** — Express routes validate input and enforce authentication, then
  controllers call services. Services hold the business rules: the recommendation engine, the scoring
  maths (pure functions) and the explanation builder (pure functions).
- **Data layer** — repositories run the Cypher in `queries/` through helpers in `config/neo4j.js`. These
  open a session, run a managed (auto-retried) transaction, convert Neo4j types to plain JSON and always
  close the session.

## 5. Data-flow explanation

**A. Liking a movie**
1. User clicks ♥ on a movie card. `FavoriteButton` updates the UI optimistically and calls
   `POST /api/users/me/likes/:movieId`.
2. API: `requireClientHeader` (CSRF) → `requireAuth` reads the JWT from the httpOnly cookie →
   `authorizeUserParam` replaces `me` with the token's userId → validator checks the movieId format.
3. `LIKE_MOVIE` runs: `MATCH` user and movie, `MERGE (u)-[l:LIKED]->(m) ON CREATE SET l.likedAt = datetime()`.
4. 201 response. The UI keeps the optimistic state and bumps `activityVersion`, so pages that show
   recommendations refetch. On error the UI rolls back and shows a toast.

**B. Getting recommendations**
1. `GET /api/recommendations/me` → auth → `loadProfile` runs `USER_TASTE_PROFILE` (seed movies with
   weights, preferred genres, consumed ids).
2. The engine builds the weighted genre profile and runs the genre, actor, director and collaborative
   queries **in parallel**.
3. Scores are normalised, combined with the available weights, sorted, and the top N are fetched with
   card data.
4. `buildExplanation` turns the shared genres, people and similar-user counts into a headline and reasons.
5. JSON goes back to `RecommendationsPage`, which renders `RecommendationCard`s with score bars.

**C. Graph exploration**
`GET /api/graph/movie/:id` returns nodes and relationships. `graphService` converts them to Cytoscape
elements with stable ids (`movie:inception-2010`) and strips private properties. The browser merges
further `GET /api/graph/neighborhood/:type/:id?offset=&limit=` pages into the same graph.

## 6. Database schema explanation

| Node | Key | Other properties |
|---|---|---|
| User | userId (unique), email (unique) | name, passwordHash, createdAt |
| Movie | movieId (unique) | title, releaseYear, overview, rating, runtime, addedAt, posterPath? |
| Genre | genreId (unique), name (unique) | |
| Actor | actorId (unique) | name |
| Director | directorId (unique) | name |

| Relationship | Properties |
|---|---|
| (User)-[:LIKED]->(Movie) | likedAt |
| (User)-[:RATED]->(Movie) | rating (1–5 integer), ratedAt |
| (User)-[:WATCHED]->(Movie) | watchedAt (latest), watchCount |
| (User)-[:PREFERS]->(Genre) | createdAt |
| (Movie)-[:IN_GENRE]->(Genre) | — |
| (Actor)-[:ACTED_IN]->(Movie) | billingOrder |
| (Director)-[:DIRECTED]->(Movie) | — |

**Why these choices**
- Uniqueness constraints give each entity a stable identity and make `MERGE` safe, so re-seeding never
  duplicates data. Each constraint also creates an index for fast lookups.
- Facts are stored once. Popularity, average user rating and movie-to-movie similarity are *computed*
  from relationships instead of stored, so they cannot go out of date.
- Relationship direction follows the sentence: *user LIKED movie*, *actor ACTED_IN movie*,
  *movie IN_GENRE genre*.

**Sample graph size (after seeding):** 80 movies, 15 genres, 178 actors, 41 directors, 8 users and 719
relationships (220 IN_GENRE, 268 ACTED_IN, 87 DIRECTED, 18 PREFERS, 62 WATCHED, 38 LIKED, 26 RATED).

## 7. Algorithm and pseudocode

```
CONFIG: weights = {genre 0.30, actor 0.15, director 0.15, collaborative 0.25, rating 0.15}
        positive rating ≥ 4; seed weight: like or 5★ = 1.0, 4★ = 0.8; preference bonus = 1.0
        actor saturation = 2, director saturation = 1, max similar users = 20

FUNCTION RECOMMEND(user, strategy, K):
    seeds      ← movies user LIKED or RATED ≥ 4, each once with its weight
    preferred  ← genres user PREFERS
    excluded   ← movies user LIKED, RATED or WATCHED

    IF seeds = ∅ AND preferred = ∅:
        RETURN most-engaged movies NOT IN excluded, labelled "popular, not personalised"

    profile[g] ← Σ weight(s) for seeds s in genre g  (+1.0 if g ∈ preferred)
    total      ← Σ profile[g]

    // A. genre                      Seed → Genre ← Candidate
    FOR each movie c ∉ excluded sharing a genre with the profile:
        genre[c] ← Σ_{g ∈ genres(c)} profile[g] / total

    // B. actors / directors        Seed ← Person → Candidate
    FOR each candidate c and DISTINCT person p linking c to some seed:
        w(c,p) ← max weight of the seeds p links to
    actor[c]    ← min(1, Σ_p w(c,p) / 2)
    director[c] ← min(1, Σ_p w(c,p) / 1)

    // C. collaborative             Seed ← OtherUser → Candidate
    FOR each other user v with a positive interaction on some seed:
        sim(v) ← |pos(user) ∩ pos(v)| / |pos(user) ∪ pos(v)|            (Jaccard)
    N ← top 20 users by sim
    collab[c] ← Σ_{v ∈ N endorsing c} sim(v)·strength(v,c) / Σ_{v ∈ N} sim(v)

    available ← components that could be computed for this user (rating always)
    FOR each candidate c (reached by at least one relationship above):
        rating[c] ← catalogueRating(c) / 10
        final[c]  ← Σ_{x ∈ available} w_x·x[c] / Σ_{x ∈ available} w_x
    SORT by final DESC, catalogueRating DESC, title ASC
    FOR the top K: build explanation from sharedGenres, sharedActors(via seeds),
                   sharedDirectors(via seeds), similarUserCount
    RETURN top K
```

**Complexity (informal):** each traversal starts from the user's seeds and expands only along their
relationships, so the cost depends on the size of the user's neighbourhood, not the whole database.
This "index-free adjacency" is the main performance argument for graph databases. No benchmarks were
run for this project.

## 8. Sample input and output

**Input:** signed in as `aarav@cinegraph.demo`, request `GET /api/recommendations/me?limit=5`.
Aarav liked Inception, Interstellar, The Matrix and Arrival; rated The Dark Knight 4★ and Blade Runner
2049 4★; prefers Sci-Fi and Thriller.

**Output (abridged, from an actual run against the seeded database):**

```
mode: personalised   weights: genre 0.30, actor 0.15, director 0.15, collaborative 0.25, rating 0.15
similar users: Priya Nair 0.333 (4 shared), Ananya Rao 0.167, Rohan Mehta 0.077, Kabir Malhotra 0.071

#1 The Prestige        0.640  {genre 0.416, actor 0.90, director 1, collaborative 0.411, rating 0.85}
   Recommended because you rated The Dark Knight 4★: it shares director Christopher Nolan,
   actors Christian Bale and Michael Caine and the Drama genre.
#2 Dune                0.574  {genre 0.584, actor 0, director 1, collaborative 0.514, rating 0.80}
   Recommended because you liked Arrival: it shares director Denis Villeneuve and the Drama and Sci-Fi genres.
#3 The Martian         0.574  {genre 0.584, actor 1, director 0, collaborative 0.514, rating 0.80}
   Recommended because you liked Interstellar: it shares actors Jessica Chastain and Matt Damon and
   the Adventure, Drama and Sci-Fi genres.
#4 Dune: Part Two      0.568
#5 The Dark Knight Rises 0.547
```

**Hand check for The Prestige — actor score 0.90:** Christian Bale links it to The Dark Knight (rated 4★
→ 0.8). Michael Caine links it to Inception/Interstellar (liked → 1.0). (0.8 + 1.0) / saturation 2 = 0.90 ✓.

**Cold-start sequence for a brand-new user (from the integration test and browser walkthrough):**

| Step | Mode returned | Example top result |
|---|---|---|
| No data | `popular` | The Dark Knight — "Popular on CineGraph: 3 users engaged with this movie." |
| Prefers Horror + Mystery | `preference-based` | Get Out — "Matches your preferred genres: Horror and Mystery." |
| Likes Get Out | `personalised` | Us — "Recommended because you liked Get Out: it shares director Jordan Peele and the Horror, Mystery and Thriller genres." |

## 9. Test cases

### 9.1 Automated (all passed in the development environment — see README §23)

53 unit/API tests (`npm test`) and 25 integration tests (`npm run test:integration`).

### 9.2 Manual test cases (demonstration checklist)

| # | Test case | Steps | Expected result |
|---|---|---|---|
| T1 | API health | Open `http://localhost:5000/api/health` | `status: ok`, `database: connected` |
| T2 | DB down | Stop Neo4j, reload a page | Friendly error card; `/api/health` → 503; API keeps running |
| T3 | Seed idempotent | Run `npm run seed` twice | Second run: 0 nodes, 0 relationships created |
| T4 | Search | Type "dark" in the navbar | Suggestions: The Dark Knight, The Dark Knight Rises |
| T5 | Genre filter | Explore → Animation | 8 movies, all tagged Animation |
| T6 | Combined filters | Sci-Fi, min rating 8, sort year | Only Sci-Fi ≥ 8.0, ordered by year; URL updated |
| T7 | No results | Animation + minimum rating 9 | Empty state "No movies match these filters" |
| T8 | Register validation | Password "abc" | Inline error: 8+ chars with letter and number |
| T9 | Login failure | Wrong password | "Invalid email or password" (same message for unknown e-mail) |
| T10 | Protected page | Visit /recommendations signed out | Redirect to login, then back after sign-in |
| T11 | Like / unlike | Click ♥ twice on a card | Toasts; profile favourites update; no duplicate LIKED |
| T12 | Rating | Rate a movie 4★, then Clear | Stars update; Profile → Ratings shows/removes it |
| T13 | Watch history | Mark as watched twice | Button shows "Watched 2×"; History tab lists it once |
| T14 | Recommendations explain | Aarav → For You → Why this movie? | Shared director/actors/genres listed; score bars |
| T15 | Recommendations change | Like Dune, return to For You | Dune no longer listed; ranking changes |
| T16 | Algorithm tabs | Click Genre / Cast & crew / Similar users | Different lists; similar users panel shows Priya |
| T17 | Cold start | Sign in as Ishaan | "Popular picks · not personalised" badge + onboarding |
| T18 | Preferences | Choose genres, Save | Badge becomes "Preference-based"; results match genres |
| T19 | Graph | Movie → Explore connections | Coloured nodes by type; legend; edges labelled on select |
| T20 | Graph interaction | Click node, then Expand / double-click | Neighbours highlighted; new nodes added; "Load more" counts |
| T21 | Graph privacy | Click another user's node | "Other users' activity is private"; no expand |
| T22 | Analytics | Open Insights | Counts match seed output (80 movies, 178 actors…) |
| T23 | Authorisation | `GET /api/recommendations/user-priya` while logged in as Aarav | 403 |
| T24 | Invalid input | `GET /api/movies?sort=foo` | 400 with field details |
| T25 | Responsive | Resize to phone width | Hamburger menu; single-column cards; no horizontal scroll |
| T26 | Keyboard | Tab through the home page; ←/→ on the carousel | Visible focus rings; carousel moves |

## 10. Viva questions and answers

**Q1. What is a graph database?**
A database that stores data as nodes (entities) and relationships (connections), both of which can have
properties. Relationships are stored physically, so following them does not need join operations.

**Q2. Why Neo4j instead of MySQL for this project?**
Recommendations are multi-hop questions ("movies that share a director with movies I liked"). In SQL each
hop is a JOIN, and queries get long and slow as hops grow. In Neo4j a hop is following a stored pointer,
and Cypher expresses the pattern directly. Neo4j also provides constraints, ACID transactions, a free
AuraDB tier and an official JavaScript driver.

**Q3. What is Cypher? Explain `MATCH (u:User)-[:LIKED]->(m:Movie)`.**
Cypher is Neo4j's declarative, pattern-based query language. The pattern finds every `User` node `u`
connected by an outgoing `LIKED` relationship to a `Movie` node `m`. Parentheses are nodes, square
brackets are relationships and the arrow is the direction.

**Q4. Difference between `CREATE` and `MERGE`?**
`CREATE` always creates new data. `MERGE` matches the pattern if it exists and creates it only if it
doesn't, so it is idempotent. The seed script and like/rate endpoints use `MERGE` to prevent duplicates.

**Q5. Why uniqueness constraints?**
They guarantee one node per id (e.g. `movieId`), make `MERGE` safe under concurrency, and create an index
for fast lookups. Without them a typo or a race could create two "Inception" nodes.

**Q6. Why parameterised queries?**
Values are sent separately from the query text (`$movieId`). This prevents Cypher injection and lets
Neo4j cache the query plan. Sort order cannot be a parameter, so it is chosen from a server-side whitelist.

**Q7. Explain the genre-based algorithm.**
Take the user's liked or highly rated movies, walk to their genres, then to other movies in those genres
that the user hasn't seen. Score = weight of the user's genre profile the movie covers ÷ total profile weight.

**Q8. How do you avoid counting the same actor twice?**
Rows are first grouped by (candidate, actor) with `max(seed.weight)`, then summed per candidate. An actor
linking the candidate to three seed movies still contributes once.

**Q9. What is collaborative filtering here, and is it "real" CF?**
It finds users who liked the same movies (similarity = Jaccard index of their positive sets) and
recommends what they also liked, weighted by similarity. It is a graph-based neighbourhood heuristic based
on co-occurrence, not a learned matrix-factorisation model, and it does not imply causation.

**Q10. What is the Jaccard index?**
|A ∩ B| / |A ∪ B|, from 0 (nothing shared) to 1 (identical sets). Aarav and Priya share 4 positive movies
out of 12 distinct ones between them → 4/12 = 0.333.

**Q11. How is the hybrid score calculated and why normalise?**
Each component is scaled to 0–1, then finalScore = Σ wᵢ·sᵢ / Σ wᵢ over available components. Normalising
puts genre counts, person counts and similarities on the same scale, so the weights mean what they say and
the final score reads as a percentage.

**Q12. What if a component is unavailable?**
It is dropped from both numerator and denominator (renormalisation). A new user with only genre
preferences is scored with genre 0.67 and rating 0.33, rather than being penalised with zeros.

**Q13. How do you handle cold start?**
No data → clearly labelled popular movies plus onboarding (pick genres, like movies). Preferences only →
preference-based results. After the first like or 4★+ rating → full personalisation.

**Q14. How do you guarantee explanations are truthful?**
Explanations are built only from fields the Cypher returned (shared genre names, shared people with the
seed titles they connect through, similar-user counts). Integration tests re-query Neo4j to confirm that
each named director and actor really connects the two movies.

**Q15. Which movies are excluded from recommendations?**
Any movie the user already liked, rated (any score) or watched. This is the documented eligibility policy.

**Q16. How is authentication implemented securely?**
Passwords are hashed with bcrypt (12 rounds). On login the server sets a signed JWT in an httpOnly,
SameSite cookie that JavaScript cannot read. Protected routes verify the token and take the user id from
it. A client-supplied user id is never trusted: `/users/:userId/...` returns 403 unless it is `me` or the
caller's own id.

**Q17. What is CSRF and how do you prevent it?**
Cross-Site Request Forgery tricks a logged-in browser into sending a request from another site. CineGraph
uses SameSite cookies, a restricted CORS origin list and a required custom header (`X-CineGraph-Client`)
on every state-changing request. Cross-site forms cannot set that header.

**Q18. How does the app behave if Neo4j is down?**
The API still starts and logs a clear message. `/api/health` returns 503, data endpoints return 503
`DATABASE_UNAVAILABLE` without stack traces, and the UI shows error cards with "Try again".

**Q19. What is a managed transaction in the Neo4j driver?**
`session.executeRead/executeWrite` runs your function inside a transaction and automatically retries it
on transient errors (e.g. leader changes). Sessions are always closed in a `finally` block.

**Q20. Why does the driver use `disableLosslessIntegers`, and why convert integers to `neo4j.int`?**
Neo4j integers are 64-bit, but JavaScript numbers are not. The option returns them as normal numbers,
which is safe for our small counts. In the other direction, JavaScript sends whole numbers as floats, so
the helper converts them to Neo4j integers. That keeps `LIMIT $limit` valid and stores years as integers.

**Q21. How does pagination work in the movie list?**
Cypher filters and sorts, collects the matching movies, returns `size(list)` as the total and a slice
`movies[$skip..$skip+$limit]` as the page. The UI's "Load more" requests the next page.

**Q22. How is the graph explorer built?**
Cytoscape.js renders nodes and edges from `/api/graph/*`. Node types have distinct colours and shapes.
Clicking a node highlights its closed neighbourhood. Expanding fetches the next page of neighbours (offset
and limit) and merges them by stable id, so nothing is duplicated.

**Q23. How did you evaluate the recommender?**
Offline hold-out: for each user, hide the most recent 25% of positive interactions, recommend using only
the rest, and measure Precision@K and Recall@K. Hidden movies are removed from both the seeds and the
exclusion list to prevent leakage. With only 7 evaluable users the numbers are illustrative. On this data,
genre-only scored higher than the hybrid, and I reported that honestly rather than tuning to the test set.

**Q24. What are the limitations?**
A small sample dataset, approximate metadata, hand-tuned weights, similarity computed per request, no
learned model, and no dislike signal beyond exclusion. See README §25.

**Q25. How would you scale it?**
Precompute similarities with Neo4j Graph Data Science (node similarity, FastRP embeddings), cache results,
add full-text indexes for search, use Neo4j clustering/AuraDB Professional, and paginate the graph more
aggressively.

**Q26. Why not store a SIMILAR_TO relationship?**
It would duplicate information already implied by shared genres and people, and it would need
recomputing whenever data changes. Computing it live keeps a single source of truth. With a large
catalogue, precomputing it (with a refresh job) becomes worthwhile.

**Q27. What does OPTIONAL MATCH do, and where is it used?**
Like a LEFT JOIN: it keeps the row and fills `null` when the pattern is missing. It is used in the movie
details query so a movie without ratings still returns, with `ratingCount` 0.

**Q28. How do you prevent duplicate ratings?**
`MERGE (u)-[r:RATED]->(m) SET r.rating = $rating` creates at most one RATED relationship per pair and
updates it on later ratings. Validation only accepts integers 1–5.

## 11. Future scope

- Larger, licensed datasets and time-windowed trending.
- Graph Data Science algorithms (node similarity, PageRank, Louvain communities, link prediction).
- Learning hybrid weights from data; diversity, novelty and serendipity in ranking.
- Negative feedback, watch-lists, reviews, social following.
- E-mail verification, password reset, OAuth sign-in, refresh tokens.
- Docker Compose deployment and continuous integration.
- Mobile app using the same API.

## 12. Conclusion

The project meets its objectives. The graph schema models the domain naturally, Cypher traversals produce
four kinds of explainable recommendations, cold start is handled, and the application is secured and
tested. The main lesson is that relationships are first-class data in a graph database: the same edges
drive the recommendations, the explanations and the visualisation.
