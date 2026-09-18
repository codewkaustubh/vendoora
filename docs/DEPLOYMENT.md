# VENDOORA Deployment & Environment Guide

This document covers the documented Phase 9 deployment requirements:
environment management, observability, and database seeding for the Render
deployment defined in `render.yaml` (see also `.github/workflows/ci.yml`).

## Architecture recap

One Node process serves both the REST API (`/api/*`) and the built SPA
(`dist/`). `render.yaml` defines a single `vendoora-app` web service plus a
managed `vendoora-postgres` instance. There is no separate frontend service.

## Environments

Two environments are provisioned, each as its own Render service plus its own
Postgres instance. They share the same variable **names**; only the **values**
differ.

| Variable | Staging | Production | Notes |
|---|---|---|---|
| `NODE_ENV` | `production` | `production` | Must be `production` on both: selects static `dist/` serving and quiet Prisma logging. |
| `LOG_LEVEL` | `debug` | `info` | Staging is noisier for debugging. |
| `PORT` | Render-injected | Render-injected | Never set manually; `server.ts` reads it. |
| `APP_URL` | staging URL | production URL | Public base URL, no trailing slash. |
| `DATABASE_URL` | staging DB | production DB | **Must never point staging at production.** Injected by Render from the linked database. |
| `JWT_SECRET` | dedicated secret | dedicated secret | **Must differ per environment** and be ≥32 chars. `openssl rand -base64 48`. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | **test** keys | **live** keys | Staging must use Razorpay test mode. |
| `CLOUDINARY_*` | staging cloud | production cloud | Separate clouds or distinct folder prefixes so assets cannot collide. |
| `VITE_RAZORPAY_KEY_ID` | unused | unused | Legacy from `.env.example`; the app receives the checkout key from the API response instead. |

Templates (placeholders only, safe to commit):
- `.env.example` — local development
- `.env.staging.example` — staging
- `.env.production.example` — production

### Secret handling rules

1. Real values live only in the Render dashboard (environment groups) or the
   Render CLI. They are **never** committed.
2. `.gitignore` ignores `.env*` and explicitly un-ignores `*.example` files so
   only templates are tracked.
3. `JWT_SECRET` must never be shared between staging and production: a staging
   token must be unusable against production.
4. Database URLs are private. They are never logged, and the health endpoint
   reports only `ok` / `unavailable`.

## Deployment flow (Render)

1. `render blueprint launch` provisions `vendoora-app` + `vendoora-postgres`
   and prompts for every `sync: false` secret.
2. `buildCommand` — `npm ci && npm run build`
3. `preDeployCommand` — `npx prisma migrate deploy` applies pending migrations
   **before** the new process receives traffic.
4. *(Optional, recommended once per fresh environment)* — seed the documented
   categories: `npx prisma db seed`
5. `startCommand` — `npm start` (`NODE_ENV=production`)
6. Render polls `GET /api/health`; the service only receives traffic once the
   database check returns `200`.

## Observability

### Logging

`pino-http` logs every request as structured JSON to stdout, which Render's
log drain forwards and indexes. `/api/health` is excluded from request logging
so periodic probes do not flood the drain. Authorization headers, cookies, and
password fields are redacted before serialization.

Levels: `trace | debug | info | warn | error`, controlled by `LOG_LEVEL`
(default `info` in production, `debug` in development).

### Error handling

- **Controllers** keep their existing per-endpoint `try/catch` (unchanged).
- A **global Express error handler** catches anything that escapes a
  controller — most importantly multer middleware failures, which never reach a
  controller. It returns 4xx with the error message when the error is a client
  error, and a generic `Internal server error` for 5xx so internals (SQL,
  connection strings, stack traces) are never leaked. 5xx errors are logged.
- **`unhandledRejection`** is logged; the process stays alive so one stray
  promise cannot drop a healthy instance.
- **`uncaughtException`** logs and exits with code 1, because process state is
  no longer trustworthy; Render restarts the service.

### Graceful shutdown

`SIGTERM` (sent by Render on every deploy) and `SIGINT` trigger: stop accepting
new connections → drain in-flight requests → `prisma.$disconnect()` → exit 0.
A 10-second force-exit timer guarantees the process never hangs the deploy.

## Health check

`GET /api/health` performs a real database round-trip (`SELECT 1` with a 2s
timeout), so it reports readiness rather than mere liveness.

- **200** `{ status: "ok", database: "ok", latencyMs, timestamp }` — process up
  **and** database reachable. Render considers the deploy healthy.
- **503** `{ status: "error", database: "unavailable", latencyMs, timestamp }`
  — process up but the database is unreachable/timed out. Render keeps the old
  instance serving traffic.

The response contains no credentials, connection strings, or stack traces.

## Database seeding

`npx prisma db seed` (wired via `package.json` → `prisma.seed`) inserts the 12
documented service categories plus the `General` fallback category that
`services.create` expects.

The seed is **idempotent and non-destructive**: rows that already exist are
left exactly as they are (no update, no delete), so admin/vendor edits are
never overwritten, and unrelated data is never touched. `Category.slug` values
deliberately match the budget calculator's pricing keys, so they must not be
renamed.

Run it once after the first `migrate deploy` on a fresh environment.
