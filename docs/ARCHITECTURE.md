# Architecture

This document explains *how* the codebase is built — the layering rules, the dependency-injection pattern, multi-tenancy, and the gotchas that aren't obvious from reading a single file. Read this before adding a new module or feature.

## Multi-tenancy

Every tenant is an `Organization`. An organization owns one or more `Store`s and any number of `User`s. **Every domain table carries an `organizationId` column, and every repository method that reads or writes tenant data takes `organizationId` explicitly as a parameter.** There is no "global" query anywhere in the codebase — this is the single rule that keeps tenants isolated. When adding a new table, add `organizationId` and an index on it, and thread it through every repository method the same way.

Auth works as: JWT access token → `AuthGuard` decodes it → `{ userId, organizationId, role }` is attached to the request as `authContext` → every usecase receives `organizationId` explicitly from the controller (via the `@CurrentAuth()` decorator) rather than re-deriving it from anywhere else.

## Backend layering (`apps/api`)

The backend is NestJS, but the domain logic is deliberately framework-agnostic below the controller layer. Dependency direction is one-way:

```
routes (Nest decorators) → controllers → usecases → services / repositories → Prisma
```

Nothing in `usecases/`, `services/`, or `repositories/` imports Fastify or HTTP types. Only controllers touch the framework directly (`@Req()`, `@Res()`, cookies, etc).

Each backend module (e.g. `products`, `sales`, `invites`) follows this folder shape:

```
apps/api/src/modules/<module>/
  <module>.controller.ts      Nest decorators only — parses/validates (zod), calls a usecase, shapes the HTTP response
  <module>.module.ts           Wires everything together (the composition root for this module)
  usecases/
    <Action><Entity>.usecase.ts   One class per business operation. @Injectable(), framework-agnostic.
  services/                    Domain services that don't belong to one usecase (e.g. PasswordService)
  repositories/
    <module>.repository.ts          Interface (port)
    <module>.repository.prisma.ts   Prisma implementation (adapter)
  dto/
    <module>.mapper.ts          Maps domain entities → the zod response shape from packages/shared
  entities/
    <Entity>.ts                 Plain TS interfaces, independent of Prisma's generated types
```

### Dependency injection

Repositories are bound to interfaces via string/Symbol tokens declared in `apps/api/src/shared/di/tokens.ts` (e.g. `PRODUCTS_REPOSITORY`). A module registers its repository like this:

```ts
{
  provide: PRODUCTS_REPOSITORY,
  useFactory: (prisma: PrismaService) => new PrismaProductsRepository(prisma),
  inject: [PrismaService],
}
```

Usecases inject the *interface* via `@Inject(TOKEN)`, never the concrete Prisma class:

```ts
constructor(@Inject(PRODUCTS_REPOSITORY) private readonly productsRepository: ProductsRepository) {}
```

Each domain module owns and exports its own repository token; other modules that need it `imports: [ThatModule]` rather than redeclaring the provider. `AuthModule`, for example, imports `OrganizationsModule`, `StoresModule`, and `UsersModule` to compose the register/login/refresh/me usecases.

### Unit-of-work pattern (multi-aggregate transactions)

Whenever a single operation must atomically touch more than one aggregate (e.g. checkout must decrement inventory, record a stock movement, *and* create the sale — all or nothing), the module defines a `<Module>UnitOfWork` interface plus a `Prisma<Module>UnitOfWork` implementation:

```ts
export interface XUnitOfWork {
  runInTransaction<T>(work: (repos: XUnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
```

The Prisma implementation wraps `prisma.$transaction()` and constructs fresh repository instances bound to the transaction client for the callback. This pattern is used by:

- `AuthUnitOfWork` — register org + store + owner user
- `InventoryUnitOfWork` — adjust stock + record movement
- `SalesUnitOfWork` — decrement stock (per line item) + record movements + create the sale
- `PurchaseOrdersUnitOfWork` — increment stock (per line item) + record movements + update the PO
- `InvitesUnitOfWork` — create the user + mark the invite accepted

If you need a new multi-aggregate transaction, copy this shape rather than reaching for a bare `prisma.$transaction()` call inside a usecase.

### Errors

Domain errors extend `AppError` (`shared/errors/AppError.ts`): `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409). A global `AppExceptionFilter` (`shared/errors/app-exception.filter.ts`) catches these plus `ZodError` (validation) and any error with a numeric `statusCode < 500` (e.g. raw `PrismaClientKnownRequestError` translated at the repository layer, or Fastify's own framework errors) and maps them to a consistent `{ error: { code, message } }` JSON body. Anything else becomes a logged 500.

### Auth & roles

- `AuthGuard` — verifies the JWT access token, attaches `authContext` to the request. Applied via `@UseGuards(AuthGuard)`, usually at the controller class level.
- `RolesGuard` + `@Roles(...)` — checks `authContext.role` against an allow-list. Applied per-route (or per-controller for reports/users, which are entirely OWNER/ADMIN/MANAGER-only).
- `@CurrentAuth()` — a param decorator that extracts `authContext` from the request and throws `UnauthorizedError` if missing, replacing repetitive boilerplate in every controller.

**Role convention**: catalog/inventory/supplier/purchase-order/discount *writes* are OWNER/ADMIN/MANAGER-only. Checkout (creating a sale) and creating a customer are open to all authenticated roles, including CASHIER, since those are day-to-day cashier tasks. Reports and the team/invites list are OWNER/ADMIN/MANAGER-only (invites creation is OWNER/ADMIN-only — only an OWNER may invite another OWNER).

### Organization approval & platform admin

Every new `Organization` is created with `status: PENDING` (register still creates the org/store/owner-user and logs them in immediately — nothing about signup itself is blocked). What's gated is everything *after* that: `AuthGuard` reads `organizationStatus` and `isPlatformAdmin` straight off the verified JWT payload (both are embedded at sign time — see `token.service.ts`) and throws `ForbiddenError` on any request whose organization isn't `APPROVED`, unless the user `isPlatformAdmin`.

Two routes are deliberately exempt via `@SkipOrgApprovalCheck()` (a `SetMetadata` decorator read the same way `RolesGuard` reads `@Roles`): `GET /api/auth/me` and `GET /api/organizations/me`. This is what lets a pending user's dashboard know *why* they're locked out instead of just erroring.

Because the JWT is signed with the org's status at that moment, approval doesn't retroactively unlock an already-issued access token. It's picked up the next time a token is (re)issued — `RefreshToken.usecase.ts` re-fetches the organization from the DB on every refresh, so in practice a pending user is unlocked automatically on their next silent token refresh (the frontend's `AuthSessionProvider` refreshes on every mount), with no explicit re-login required.

`isPlatformAdmin` is a `User` boolean that is **not settable through any API** — it only exists via `prisma/seed.ts` (env-configured: `PLATFORM_ADMIN_EMAIL`/`PLATFORM_ADMIN_PASSWORD`/etc, idempotent upsert) or direct DB access. A platform admin's own organization ("Platform", seeded pre-approved) is otherwise a completely normal tenant — the only special behavior is that `AuthGuard` bypasses the approval check for them and `PlatformAdminGuard` (checked via `@UseGuards(AuthGuard, PlatformAdminGuard)` on `PlatformAdminController`) is the only thing gating `/api/platform/organizations`: list pending/approved/rejected orgs, `POST :id/approve`, `POST :id/reject`. There's no separate admin login flow — platform admins sign in through the same `/login` page as everyone else.

## Frontend architecture (`apps/web`)

Domain/feature-based, not layer-based. `app/` (the Next.js App Router) contains **no business logic or direct fetch calls** — pages are thin and compose components from `features/*`.

```
apps/web/src/
  app/                  Next.js routing only
  features/<domain>/
    api/                fetch functions using the shared httpClient
    hooks/              TanStack Query hooks (useX for queries, useCreateX for mutations)
    components/         feature-local React components
    context/             (rare — only auth needs a context provider)
    index.ts             the feature's public barrel — the ONLY thing other features may import
  shared/
    api/httpClient.ts    fetch wrapper: base URL, Authorization header, ApiError normalization
    components/ui/       design-system primitives (Button, Input, Card)
    lib/                 formatCurrency, etc.
```

**Cross-feature imports go through the barrel only** (`import { useProducts } from "../../catalog"`, never reaching into `features/catalog/hooks/useProducts` directly from another feature). This is enforced by convention, not tooling — keep it that way when adding new features.

### Common patterns

- **Inline quick-create**: several forms let you create a related entity without leaving the page (new category inline in the product form, new supplier inline in the PO form, new customer inline in checkout). Copy this pattern rather than routing to a separate "create X" page for lightweight reference data.
- **Cross-feature query invalidation**: mutations that affect another feature's data invalidate that feature's query key too — e.g. completing a sale or receiving a PO both invalidate the inventory feature's `storeInventoryQueryKey`, imported via `features/inventory`'s barrel.
- **Role-conditional UI**: nav links and page bodies check `session.user.role` client-side to hide options a role can't use (e.g. CASHIER doesn't see the Reports link). This is a UX nicety only — the backend's `RolesGuard` is the actual enforcement; never rely on the frontend check alone.

## Known gotchas (read before you hit them)

- **`packages/shared` uses NodeNext-style `.js`-suffixed relative imports that point at `.ts` files** (e.g. `export * from "./enums/role.js"` in a file where `role.ts` is what actually exists). This is required for `apps/api`'s `ts-node`/`tsc` (NodeNext module resolution) to resolve the package correctly. Node's own loader maps `.js` → `.ts` automatically; **webpack's production bundler does not**, so `apps/web/next.config.mjs` has a `resolve.extensionAlias` entry teaching it to. If you ever see `Module not found: Can't resolve './enums/X.js'` in a `next build`, check that alias is still in place before assuming something else broke.
- **`apps/api` dev server uses `ts-node/esm`, not `tsx`.** NestJS's dependency injection relies on `emitDecoratorMetadata`, which requires a real type-checking TypeScript compiler pass — `tsx`/esbuild strip types without emitting that metadata, which silently breaks DI. `ts-node` does full compilation, so it works. Don't swap the dev script to `tsx` for a "faster" reload.
- **`.env` isn't loaded by ts-node.** The dev script explicitly passes `--env-file=.env` to Node. (`tsx` had implicit dotenv loading; `ts-node` doesn't — this bit us once mid-project.)
- **tsconfig has `useDefineForClassFields: false` and `target: ES2021`.** Bumping the target to ES2022+ flips `useDefineForClassFields` to `true` by default, which silently breaks NestJS's constructor-parameter-property DI. Don't change the target without re-checking this.
- **The root `fastify` package version is pinned to match exactly what `@nestjs/platform-fastify` bundles internally.** Two different copies of `fastify` in `node_modules` (even semver-compatible ones) cause nominal TypeScript type mismatches on `FastifyRequest`/`FastifyReply` (e.g. `.cookies`/`.setCookie` appear "missing"). If you bump either dependency, verify `find node_modules/.pnpm -maxdepth 1 -name "fastify@*"` still shows exactly one version.
- **CORS methods are explicitly listed in `main.ts`**, not left to `@fastify/cors`'s auto-detection. The auto-detection breaks silently (no server-side error — just a browser-console CORS failure) when multiple parameterized routes share a prefix, which happens throughout this API (e.g. `/inventory`, `/inventory/adjustments`, `/inventory/:productId/reorder-threshold` on one controller). If a new HTTP method ever needs adding to `app.enableCors({ methods: [...] })` in `apps/api/src/main.ts`, do it explicitly.
- **Prisma money fields are always integer cents** (`priceCents`, `totalCents`, etc), never floats. Format to currency only at the presentation layer (`formatCentsAsCurrency` on the frontend).
