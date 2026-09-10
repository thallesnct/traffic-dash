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
docker compose up -d          # PostgreSQL on 5432, Redis on 6379
npm run build -w packages/shared
npm run db:migrate
npm run seed
```

Four things worth knowing about this sequence:

- **`packages/shared` must be built before the API runs.** The API imports it as a package and
  resolves it from `dist/`, so a source only change is invisible until you rebuild. Run
  `npm run dev:shared` in its own terminal to rebuild on save.
- **`npm run seed` should take about 30 seconds** and write 222,300 rows — 195 countries × 190 days × 6 vehicle types. It is idempotent: rerunning it neither duplicates rows nor overwrites values you have edited.
- **Root scripts load `.env` themselves** through `dotenv-cli`, so no manual export is needed for anything in the table below.
- **Raw `npx prisma` and `psql` commands do not**, since `dotenv-cli` only wraps npm scripts. Run `set -a && source .env && set +a` first in any terminal where you use them directly.

## Running

```bash
npm run dev:api        # API with watch reload
npm run dev:client     # Vite dev server
npm run dev:shared     # rebuild shared contracts on save
```

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