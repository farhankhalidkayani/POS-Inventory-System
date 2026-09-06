# Deployment

**Stack**: Vercel (`apps/web`) + Render (`apps/api`) + a managed Postgres (this project is currently configured for an Aiven instance).

## 0. Prerequisites

- Repo pushed to GitHub (both Vercel and Render deploy from a connected repo).
- A Postgres instance reachable from the internet, with its connection string and (if the provider requires it) a CA certificate for TLS. See `apps/api/.env` for the current `DATABASE_URL` format — `sslmode=require&sslrootcert=./certs/aiven-ca.pem`. The CA cert lives at `apps/api/certs/aiven-ca.pem` and is committed (it's a public certificate, not a secret).
- Two secrets you'll generate fresh for production (don't reuse the local dev values): `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Generate each with `openssl rand -hex 32`.

## 1. Deploy the API to Render

The repo includes `render.yaml` (a Render "Blueprint") describing the service, so most fields are pre-filled.

1. In the Render dashboard: **New → Blueprint**, connect the GitHub repo. Render will detect `render.yaml`.
2. It defines one web service, `pos-api`, on the free plan, running:
   - **Build**: installs dependencies (including devDependencies — needed for the TypeScript/Prisma CLI at build and pre-deploy time) and builds `apps/api` and its `@pos/shared` dependency via Turborepo.
   - **Pre-deploy**: runs `prisma migrate deploy` (applies schema migrations) then the seed script (idempotent — creates/updates the platform-admin account) against the target database, before the new version takes traffic.
   - **Start**: `node dist/main.js` — the real compiled build, not `ts-node`.
   - **Health check**: `GET /health`.
3. Fill in the env vars marked `sync: false` in `render.yaml` (Render will prompt for these during Blueprint setup — they're not stored in the file):
   - `DATABASE_URL` — your Postgres connection string, e.g. the Aiven one already used locally (`postgres://avnadmin:...@...:24425/defaultdb?sslmode=require&sslrootcert=./certs/aiven-ca.pem`). The relative `sslrootcert` path resolves correctly because `startCommand`/`preDeployCommand` both `cd apps/api` first.
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — the secrets you generated above.
   - `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD` — credentials for the seeded platform-admin account (see `docs/ARCHITECTURE.md#organization-approval--platform-admin`).
   - `CORS_ORIGIN` — leave a placeholder for now (e.g. `https://placeholder.vercel.app`); you'll come back and set this to the real Vercel URL in step 3.
4. Deploy. Once live, note the service URL, e.g. `https://pos-api-xxxx.onrender.com`.

If `preDeployCommand` isn't supported on your Render plan/UI, run it once manually from the service's **Shell** tab after the first deploy:
```
cd apps/api && npx prisma migrate deploy && node --loader ts-node/esm prisma/seed.ts
```

## 2. Deploy the web app to Vercel

1. In the Vercel dashboard: **Add New → Project**, import the same repo.
2. Set **Root Directory** to `apps/web`. Vercel will pick up `apps/web/vercel.json`, which overrides the install/build commands to run through Turborepo from the repo root (so `@pos/shared` builds before `apps/web` does — see `docs/ARCHITECTURE.md` for why `@pos/shared` needs a real build step).
3. Framework preset: Next.js (auto-detected).
4. Add an env var: `NEXT_PUBLIC_API_URL` = the Render URL from step 1 (e.g. `https://pos-api-xxxx.onrender.com`, no trailing slash).
5. Deploy. Note the resulting URL, e.g. `https://your-app.vercel.app`.

## 3. Close the loop: point the API's CORS at the real frontend URL

Go back to the Render service's env vars and set `CORS_ORIGIN` to the exact Vercel URL from step 2 (no trailing slash). Save — Render redeploys automatically. Cross-origin requests (and the refresh cookie, which is `SameSite=None; Secure` in production specifically so it survives being sent cross-site between the two domains — see `auth.controller.ts`) only work once this matches exactly.

## 4. Verify

1. Visit the Vercel URL, register a new organization — it should land on the "Approval pending" screen (see `docs/ARCHITECTURE.md#organization-approval--platform-admin`).
2. Log in with the `PLATFORM_ADMIN_EMAIL`/`PLATFORM_ADMIN_PASSWORD` you set, go to **Organization Approvals**, approve it.
3. Reload the first session (no re-login needed — the refresh token flow picks up the new status) and confirm the full dashboard unlocks.

## Render free-tier cold starts

The free plan spins the service down after 15 minutes idle; the next request pays a ~30-50s cold start. Two options:
- **Live with it** — fine for a demo/staging environment.
- **Keep it warm** — an external scheduler (GitHub Actions cron, UptimeRobot, cron-job.org) hitting `GET /health` every ~10-14 minutes prevents the spin-down. Render's free tier caps usage at 750 instance-hours/month shared across your free services; running one service warm 24/7 uses nearly all of that budget on its own, so this only comfortably works if `pos-api` is your only free Render service.
