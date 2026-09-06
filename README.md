# POS & Inventory System

A generic, white-label, multi-tenant Point-of-Sale and Inventory Management platform. Any business (or businesses — the app is multi-tenant from the ground up) can register an organization, staff it with role-based users, manage a product catalog and per-store stock, run checkout, purchase from suppliers, and report on sales — all from one codebase.

## Feature overview

- **Auth & organizations** — email/password auth with JWT access + refresh tokens; every account belongs to one `Organization`, which owns one or more `Store`s.
- **Organization approval** — new organizations register in a `PENDING` state and can't use the platform until a platform admin approves them via a dedicated admin panel (`/platform-admin/organizations`). See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#organization-approval--platform-admin).
- **Team & roles** — four roles (`OWNER`, `ADMIN`, `MANAGER`, `CASHIER`); OWNER/ADMIN invite teammates via a shareable link (token-based, no email sending required).
- **Catalog** — products, categories, barcodes.
- **Inventory** — per-store stock levels, manual adjustments, configurable low-stock reorder thresholds.
- **Checkout (POS)** — cart-based sale flow with barcode scanning, optional customer attachment, discount codes, and a pluggable payment provider (ships with a mock provider that always succeeds — swap in a real gateway by implementing one interface).
- **Purchasing** — suppliers and purchase orders, with full or partial receiving that updates inventory automatically.
- **Reporting** — sales summaries, top products, low-stock alerts (OWNER/ADMIN/MANAGER only).
- **Customers & discounts** — lightweight CRM fields on sales, percentage/fixed discount codes.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it's built, [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) for the full schema, [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) for every endpoint, [`docs/FRONTEND_GUIDE.md`](docs/FRONTEND_GUIDE.md) for the web app's structure, and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) to deploy it (Vercel + Render).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | NestJS (TypeScript) on Fastify, Prisma ORM, PostgreSQL |
| Frontend | Next.js (App Router), Tailwind CSS, TanStack Query |
| Shared | `zod` schemas + inferred types, shared between both apps |
| Monorepo | pnpm workspaces + Turborepo |
| Auth | JWT access token (in-memory on the client) + httpOnly refresh cookie |

## Monorepo layout

```
apps/
  api/     NestJS backend — see docs/ARCHITECTURE.md for the layering pattern
  web/     Next.js frontend — see docs/FRONTEND_GUIDE.md for the feature pattern
packages/
  shared/  zod schemas + TS types used by both apps (single source of truth for API contracts)
  config/  shared tsconfig + eslint config
docs/      project documentation (this is the index; start with docs/ARCHITECTURE.md)
```

## Getting started

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Docker (for local Postgres)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment files and fill in secrets
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Start Postgres
docker compose up -d

# 4. Run database migrations
pnpm --filter api prisma migrate dev

# 5. Seed the first platform admin (set PLATFORM_ADMIN_* env vars in apps/api/.env first)
pnpm --filter api seed

# 6. Start both apps in dev mode
pnpm --filter api dev    # http://localhost:4000
pnpm --filter web dev    # http://localhost:3000
```

Then open `http://localhost:3000/register` to create your first organization — it will sit in a `PENDING` state until someone signs in with the seeded platform-admin account (default `platform-admin@pos.local` / `change-me-please` unless overridden) and approves it from `/platform-admin/organizations`.

### Common commands (run from repo root, or with `--filter <api|web|shared>`)

```bash
pnpm dev          # start dev servers (turbo)
pnpm build        # build all apps
pnpm lint         # eslint across the workspace
pnpm typecheck    # tsc --noEmit across the workspace
pnpm test         # vitest (apps/api usecase unit tests)
pnpm db:migrate   # prisma migrate dev (shortcut for apps/api)
pnpm db:seed      # create/update the platform admin account (shortcut for apps/api)
```

### Postgres port note

`docker-compose.yml` maps Postgres to host port **5433** (not the default 5432) to avoid clashing with other local Postgres instances. `apps/api/.env.example` already points at `5433` — keep them in sync if you change one.

## Default local ports

| Service | Port |
|---|---|
| API (`apps/api`) | 4000 |
| Web (`apps/web`) | 3000 |
| Postgres (Docker) | 5433 → container's 5432 |
