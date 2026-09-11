# Traffic Dashboard

A traffic-insights application: a NestJS API over PostgreSQL and Redis, a React client, and a shared contracts package holding the Zod schemas both sides validate against.

```
apps/api        NestJS API      → http://localhost:3333
apps/client     React + Vite    → http://localhost:5174
packages/shared Zod schemas and calendar helpers, consumed by both
```

## Requirements

| Tool | Version used |
|---|---|
| Node | 24.x (npm workspaces) |
| Docker | with Compose v2, for PostgreSQL and Redis |

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d postgres redis   # PostgreSQL on 5432, Redis on 6379
npm run build -w packages/shared
npm run db:migrate
npm run seed
```

Four things worth knowing about this sequence:

- **`packages/shared` must be built before the API or the client runs.** Both import it as a
  package and resolve it from `dist/`, so a source only change is invisible until you rebuild. Run
  `npm run dev:shared` in its own terminal to rebuild on save; if the client keeps serving the old contracts after a rebuild, restart Vite.
- **`npm run seed` should take about 30 seconds** and write 222,300 rows — 195 countries × 190 days × 6 vehicle types. It is idempotent: rerunning it neither duplicates rows nor overwrites values you have edited.
- **Root scripts load `.env` themselves** through `dotenv-cli`, so no manual export is needed for anything in the table below.
- **Raw `npx prisma` and `psql` commands do not**, since `dotenv-cli` only wraps npm scripts. Run `set -a && source .env && set +a` first in any terminal where you use them directly.

## Running

```bash
npm run dev:api        # API with watch reload
npm run dev:client     # Vite dev server
npm run dev:shared     # rebuild shared contracts on save
```

The client is not self-sufficient: the dev server proxies nothing and mocks nothing, so every chart calls `VITE_API_URL` directly and needs the API, PostgreSQL and Redis already up.

Check the API is up:

```bash
curl http://localhost:3333/health
curl 'http://localhost:3333/api/traffic/trend?window=7d'
```

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | process liveness and uptime; touches no datastore |
| GET | `/ready` | readiness; runs `SELECT 1` through Prisma |
| GET | `/countries` | catalog, database-backed |
| GET | `/vehicle-types` | catalog, database-backed |
| GET | `/api/traffic/trend` | `?window=7d\|30d\|90d`, busiest five countries plus an `other` summary |
| GET | `/api/traffic/by-country` | `?window=…`, every country, descending by total |
| GET | `/api/traffic/by-vehicle-type` | `?window=…&country=XX`, `country` optional |

`window` defaults to `30d`. The query schemas are strict, so an unrecognised parameter is a 400,
as is an unknown `country`. Aggregate responses carry `X-Cache`, `Vary: Accept-Encoding` and
`Cache-Control: no-store`; `X-Cache` is exposed to the browser through CORS.

## Client

```bash
npm run dev:client
npm run build -w apps/client
npm run preview -w apps/client
npm run test -w apps/client
npm run typecheck -w apps/client

## Docker

The same Compose file also builds and runs the application: `api` from `apps/api/Dockerfile` and
`web`, an nginx image serving the built client, from `apps/client/Dockerfile`.

Only prerequisite would be setting up your `.env` file. (Check [Setup](#setup)).

Also note that running inside docker means you would lose hot reloading, meaning you would need to rebuild the image after a change (docker compose up -d --build <image>).

```bash
docker compose up -d --build                     # all four services
docker compose run --rm api npm run seed:prod
docker compose ps
curl -i http://localhost:5174/api/traffic/trend?window=30d # if you want to check the API
open http://localhost:5174 # to check the client side app
```

| Service | Host URL | Notes |
|---|---|---|
| web | `http://localhost:5174` | nginx serves the client and proxies `/api/`, `/countries`, `/vehicle-types`, `/health` and `/ready` to the api container |
| api | `http://localhost:3333` | the same port the host API uses too, so only one of them can run |
| postgres, redis | 5432, 6379 | the same containers the host workflow already uses |

## Checks

```bash
npm run test           # shared + api + client
npm run typecheck      # all three workspaces
npm run build          # shared, then api, then client
npm run format:check
```

To run one workspace's tests: `npm run test -w apps/api (or apps/client or packages/shared in this scenario)`.

## Database

```bash
npm run db:migrate                 # prisma migrate dev
npm run db:migrate:extend          # prisma migrate deploy - run this on CI so that only new migrations are ran (this requires a pre-existing prisma/migrations folder)
npm run seed
```

The schema lives in `apps/api/prisma/schema.prisma` with the models split under
`prisma/models/`.

## Environment

`.env.example` is the reference; `cp` it to `.env` and adjust if a port is taken.

## Scalability discussion

Reads are cached in Redis for 60 seconds, and every write bumps a generation counter that invalidates all of it at once. So the number that matters here isn't reads per second, it's how often someone writes.

At 5 RPS nothing needs changing. Each key is rebuilt at most once a minute and everything else should come down to a Redis lookup.

At 50 RPS two problems could show up. When a key expires, every request that arrives during the rebuild runs the same query, so the cache needs a lock that lets one request do the work while the rest
wait. 

And a single Node process only uses one core, so one possible option would be to run a few API replicas behind nginx (could leverage existing dockerization for that), as they hold no state and share the same Redis instance/endpoint. It would also be worth making a write invalidate only the country it touched rather than the whole cache as it currently does.

At 500 RPS a Redis round trip per request is too much, so this is where a second cache layer could shine: introducing an LRU cache inside each replica, in front of Redis, with pub/sub telling the replicas when to drop an entry.

After that, there could be some more usual improvements to be made: introduce read replicas for PostgreSQL, pre-computing the window of each country every day (as new data should come daily, and a window only changes 1 row per day) and last but not least, serving a slightly stale aggregate while a new one is computed in the background.
