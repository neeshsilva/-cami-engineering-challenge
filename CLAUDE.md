# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A take-home engineering challenge: a small full-stack slice with **deliberately planted issues**. `README.md` is the spec — it lists the core tasks (list N+1 performance, stale UI after mutations, red CI, fat `classify` controller, classification history + classifier provider seam) and stretch tasks. Prefer targeted fixes toward each stack's idioms over rewrites. Record trade-offs in `DECISIONS.md` and AI usage in `AI_USAGE.md` (both required, and CI checks they exist).

npm workspaces monorepo (Node 20+):

- `apps/api` (`@cami/api`): NestJS 11 + TypeORM + PostgreSQL, port 3001
- `apps/web` (`@cami/web`): Next.js (App Router) + React 19 + TanStack Query + Tailwind, port 3000

## Commands

```bash
docker compose up db -d                                   # Postgres only (cami/cami@localhost:5432/cami)
export DATABASE_URL=postgres://cami:cami@localhost:5432/cami
npm install
npm run migration:run                                      # tsx apps/api/src/run-migrations.ts
npm run seed                                               # 1200 requests + notes; no-op if already seeded
npm run dev:api                                            # nest start --watch
npm run dev:web                                            # next dev -p 3000
docker compose up --build                                  # full stack; api container migrates + seeds on start

npm run typecheck                                          # tsc --noEmit for both apps
npm test                                                   # vitest (api only; web has no tests)
npm run build
npx vitest run test/classifier.test.ts -w @cami/api        # single test file (or: cd apps/api && npx vitest run -t "name")
```

There's no lint script. CI runs `npm run lint --if-present`, so the step is a no-op.

## Architecture

**API.** There's one feature module, `apps/api/src/requests/`, made up of a controller, a service, a `KeywordClassifier` and two entities: `CustomerRequest`, which has many `RequestNote`. `GET /requests` returns `RequestListItem` (with a note count and the latest note preview), not raw entities. `GET /requests/history` is a stub that returns an empty list.

**Two separate TypeORM configurations, kept in sync by hand:**

- `app.module.ts`: the runtime Nest app. Its `entities` list is explicit and query logging is on.
- `data-source.ts`: used by `run-migrations.ts` and `seed.ts`. Both its `entities` and `migrations` arrays are explicit (migration classes are imported, not globbed).

Adding an entity or migration means registering it in both places, and in `RequestsModule`'s `TypeOrmModule.forFeature`. `synchronize` is false everywhere, so schema changes always go through hand-written SQL migrations in `src/migrations/`. Those use `CREATE ... IF NOT EXISTS` and snake_case columns, which the entities map to camelCase.

**Web.** `src/lib/api.ts` is the only HTTP client (it reads `NEXT_PUBLIC_API_URL` and falls back to `http://localhost:3001`). Its types duplicate the API's response shapes by hand, so change both sides together. Pages are client components (`'use client'`) that use TanStack Query. The `QueryClient` defaults in `providers.tsx` (`staleTime: 10s`, no refetch on focus) matter when reasoning about stale data. The `['requests']` query key backs the main table.

**CI** (`.github/workflows/ci.yml`): `npm ci` → artifact checks → typecheck → test → migrate → build, against a `postgres:16-alpine` service. Watch for differences between CI and local runs, such as lockfile/`npm ci` strictness and per-step env overrides like `DATABASE_URL`.
