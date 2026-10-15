# AlgoCanvas — Interactive Algorithm Learning Platform

Visualize algorithms step by step, browse an algorithm library and practice problems, keep study notes, bookmark items and track progress. MERN stack, JavaScript only, **no authentication**.

> **Shared demo workspace.** There are no accounts. Notes, bookmarks and progress are stored in one shared database and are *not private*. Public write endpoints are rate limited and validated, but don't store anything sensitive.

## Status (be honest about what was verified)

| Area | State |
|---|---|
| Algorithm engines (bubble/selection/insertion/merge sort, binary search, BFS, DFS, Dijkstra) | Implemented, **13 automated tests pass** (`frontend: npm test`) |
| Backend validation helpers + seed data validity | Implemented, **9 automated tests pass** (`backend: npm test`) |
| Express API, Mongoose models, controllers, seed script | Implemented and syntax-checked. **Not yet run against a real MongoDB** — follow "Verify the API" below |
| React UI (all pages) | Implemented and syntax-checked. **Not yet run in a browser / `vite build` not run** |
| Deployment | Not done. Steps below |

Please run the checklists below and report any failure so it can be fixed.

## Stack
React 18, Vite, Tailwind CSS 3, React Router 6, Redux Toolkit (bookmarks + toasts only), Express 4, Mongoose 8, helmet, cors, express-rate-limit, dotenv.

## Structure
```
backend/
  src/ config/ models/ controllers/ routes/ services/ middleware/ validators/ utils/ app.js server.js
  scripts/ seed.js seedData.js
  tests/
frontend/
  src/ algorithms/ components/ data/ features/ hooks/ layouts/ pages/ services/ utils/
  tests/
```
Visualizations run entirely in the browser (`src/algorithms`). The backend supplies metadata (name, pseudocode, complexity, explanation).

## Setup
Requirements: Node 18+, a MongoDB Atlas URI or local MongoDB.
```bash
# backend
cd backend && npm install
cp .env.example .env        # set MONGODB_URI
npm run seed                # 13 algorithms, 10 problems
npm run dev                 # http://localhost:5000

# frontend (second terminal)
cd frontend && npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```
`npm run seed` resets algorithms, problems, bookmarks and progress; notes are kept.

## Data model (why each exists)
- **Algorithm / Problem** — library content; unique `slug` for URLs; indexes on category/difficulty/topics.
- **Note** — free-form study notes; `topic` restricted to a fixed list so filtering is reliable.
- **Bookmark** — `{itemType, itemId}` with a **unique compound index** (no duplicates). The item is looked up at read time rather than copied.
- **Progress** — `{itemType, itemId, status, lastStudiedAt, completedAt}` with a unique compound index, so a problem can never be counted twice. Summary numbers are computed from these records, nothing derived is stored.

Progress rules: statuses are `not_started`, `in_progress`, `completed`. A completed item cannot go straight back to `not_started` (reopen it as `in_progress`).

## API
All responses: `{ success, data, meta? }` or `{ success:false, error:{ message, details? } }`.

| Method & path | Notes |
|---|---|
| GET `/api/health` | 200 if DB connected, 503 otherwise |
| GET/POST `/api/algorithms`, GET `/api/algorithms/:slug`, PATCH/DELETE `/api/algorithms/:id` | query: `category`, `difficulty`, `search`, `sort`, `page`, `limit` |
| GET/POST `/api/problems`, GET `/api/problems/:slug`, PATCH/DELETE `/api/problems/:id` | query: `topic`, `difficulty`, `search`, `sort`, `page`, `limit` |
| GET/POST `/api/notes`, GET/PATCH/DELETE `/api/notes/:id` | query: `topic`, `search`, `sort`, `page`, `limit` |
| GET/POST `/api/bookmarks`, DELETE `/api/bookmarks/:id` | POST `{itemType, itemId}`; 404 if item missing, 409 if duplicate |
| GET/POST `/api/progress`, PATCH `/api/progress/:id`, GET `/api/progress/summary` | POST `{itemType,itemId,status?}`; 409 if record exists |

Status codes: 200, 201, 204 (deletes), 400 (validation / bad ObjectId / bad query), 404, 409, 413, 429, 500 (no stack in production), 503 (DB down).

## Verify the API (curl)
```bash
curl localhost:5000/api/health
curl "localhost:5000/api/algorithms?category=Sorting&limit=2"
curl localhost:5000/api/algorithms/merge-sort
curl "localhost:5000/api/algorithms?category=Nope"                    # 400
curl localhost:5000/api/notes/123                                      # 400 invalid id
curl -X POST localhost:5000/api/notes -H 'Content-Type: application/json' -d '{}'   # 400 with details
curl -X POST localhost:5000/api/notes -H 'Content-Type: application/json' \
  -d '{"title":"Heaps","topic":"Sorting","content":"Notes about heaps"}'            # 201
curl -X POST localhost:5000/api/notes -H 'Content-Type: application/json' -d '{bad'  # 400 invalid JSON
# bookmarks: use an _id from GET /api/algorithms
curl -X POST localhost:5000/api/bookmarks -H 'Content-Type: application/json' \
  -d '{"itemType":"algorithm","itemId":"<ID>"}'     # 201, repeat -> 409
curl localhost:5000/api/progress/summary
```

## Verify the UI
Algorithms page filters/search/pagination · each of the 8 visualizers: start, pause, step back/forward, reset, speed, size, new array · graph start/destination pickers · create/edit/delete a note (with confirm dialog) · bookmark then remove · set status on an algorithm and a problem, then check the Progress page · stop the backend and confirm error states appear · resize to a phone width.

## Deployment (not done yet)
1. MongoDB Atlas: create a cluster, allow your host's IPs, copy the URI.
2. Backend (Render/Railway/etc.): root `backend`, build `npm install`, start `npm start`. Env: `MONGODB_URI`, `NODE_ENV=production`, `CLIENT_URL=<your frontend origin>`. Run `npm run seed` once.
3. Frontend (Netlify/Vercel/etc.): root `frontend`, build `npm run build`, output `dist`. Env: `VITE_API_URL=https://<api-host>/api`. Add an SPA fallback rewrite to `index.html`.
4. Re-run the curl and UI checks against the deployed URLs.

## Known limitations / future work
- Pseudocode is shown in a plain code block (no syntax highlighter, no per-line highlighting).
- Linear search, DP and tree algorithms are documented but have no visualizer yet.
- No code-execution judge for problems.
- Search uses escaped regex matching, fine for this dataset size; add a text index if it grows.
- No automated API integration tests yet (would need a test database).
