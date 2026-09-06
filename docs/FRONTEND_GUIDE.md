# Frontend Guide

`apps/web` is a Next.js App Router app organized by feature (see `ARCHITECTURE.md#frontend-architecture-appsweb` for the folder-shape rules). This doc walks through what each feature does, which pages use it, and how to extend it.

## Pages → features map

| Page | Feature(s) used | Notes |
|---|---|---|
| `app/(auth)/register/page.tsx` | `auth` | `RegisterForm`; creates org + store + owner, logs in. |
| `app/(auth)/login/page.tsx` | `auth` | `LoginForm`. |
| `app/(auth)/accept-invite/page.tsx` | `auth`, `team` | `AcceptInviteForm`; reads `?token=` from the URL, shows invite details, sets a password, logs in. |
| `app/page.tsx` | `auth` | Root route — redirects to `/dashboard` or `/login` depending on session. |
| `app/dashboard/page.tsx` | `auth` | Landing page after login; role-conditional nav to every other page. If the caller's organization isn't `APPROVED` yet (and they aren't a platform admin), this renders a pending/rejected notice instead of the normal dashboard. |
| `app/platform-admin/organizations/page.tsx` | `platform-admin` | `OrganizationApprovalList` — only reachable/rendered when `session.user.isPlatformAdmin` is true; redirects everyone else to `/dashboard`. |
| `app/products/page.tsx` | `catalog` | `ProductForm` + `ProductList`. |
| `app/inventory/page.tsx` | `inventory` | `InventoryTable` — stock levels, adjustments, reorder thresholds. |
| `app/checkout/page.tsx` | `sales`, `catalog`, `customers`, `discounts` | `CheckoutCart` — the POS screen. |
| `app/sales/page.tsx` | `sales` | `SalesHistory`. |
| `app/purchase-orders/page.tsx` | `purchase-orders`, `suppliers` | `PurchaseOrderForm` + `PurchaseOrderList` (create, receive, cancel). |
| `app/discounts/page.tsx` | `discounts` | `DiscountForm` + `DiscountList`. |
| `app/reports/page.tsx` | `reports` | `SalesSummaryCard`, `TopProductsList`, `LowStockAlert`. |
| `app/team/page.tsx` | `team` | `TeamMemberList`, `InviteForm`, `InviteList`. |

All pages under `app/` are thin: they render a page-level heading/layout and compose the components above — no direct `fetch` calls or business logic live in `app/`.

## Feature reference

### `features/auth`
Exports: `AuthSessionProvider`, `useAuthSession`, `AuthSession` (type), `LoginForm`, `RegisterForm`, `useLogout`.

`AuthSessionProvider` wraps the whole app (in `app/layout.tsx`) and is the one feature allowed a React Context — it holds the in-memory access token, fetches `/api/auth/me` on load, and exposes `useAuthSession()` to every other feature/page for `{ user, organization, store }` and role checks. Token refresh (`/api/auth/refresh`) is handled transparently by `shared/api/httpClient.ts` on a 401.

### `features/catalog`
Exports: `ProductForm`, `ProductList`, `useProducts`, `useFindProductByBarcode`.

`ProductForm` creates/edits a product (name, SKU, price, barcode, category — with inline "create new category" support). `useFindProductByBarcode` is a mutation (not a query, since it's triggered on demand from a scan) consumed by `features/sales`'s `CheckoutCart` for the barcode-scan add-to-cart flow.

### `features/inventory`
Exports: `InventoryTable`, `storeInventoryQueryKey`.

`InventoryTable` shows per-product stock with inline adjustment and reorder-threshold controls. `storeInventoryQueryKey` is exported specifically so other features (`sales`, `purchase-orders`) can invalidate inventory's cache after an operation that changes stock — see the cross-feature invalidation pattern in `ARCHITECTURE.md`.

### `features/sales`
Exports: `CheckoutCart`, `SalesHistory`.

`CheckoutCart` is the POS screen: product picker (dropdown or barcode scan — both funnel through one shared `addProductToCart` helper), optional customer attach (with inline quick-create via `features/customers`), optional discount code, and a submit that calls `POST .../sales` and invalidates both the sales and inventory query keys on success. `SalesHistory` lists past sales with expandable line items.

### `features/purchase-orders`
Exports: `PurchaseOrderForm`, `PurchaseOrderList`.

`PurchaseOrderForm` creates a PO (supplier + line items with quantity/cost). `PurchaseOrderList` shows POs with status badges (`ORDERED`/`PARTIALLY_RECEIVED`/`RECEIVED`/`CANCELLED`) and, for open POs, a per-line-item "receive now" input prefilled with the remaining quantity — submitting invalidates the inventory query key too, since receiving increments stock.

### `features/suppliers`
Exports: `useSuppliers`, `useCreateSupplier`.

Hooks only — no exported components. Consumed by `PurchaseOrderForm` for the supplier dropdown and its inline "create new supplier" flow.

### `features/customers`
Exports: `useCustomers`, `useCreateCustomer`.

Hooks only, same pattern as `suppliers` — consumed by `CheckoutCart`'s inline "create new customer" flow.

### `features/discounts`
Exports: `DiscountForm`, `DiscountList`.

Standalone management page (`/discounts`) for OWNER/ADMIN/MANAGER. `CheckoutCart` doesn't import this feature directly — it just sends the raw discount code string to the sale-creation endpoint, which validates it server-side.

### `features/reports`
Exports: `SalesSummaryCard`, `TopProductsList`, `LowStockAlert`.

Three independent read-only widgets composed on `/reports`, each backed by its own query hook against `/api/stores/:storeId/reports/*`.

### `features/team`
Exports: `TeamMemberList`, `InviteForm`, `InviteList`, `AcceptInviteForm`.

`TeamMemberList` shows current org members and roles (read-only). `InviteForm` + `InviteList` (create/copy-link/revoke) are used on `/team`. `AcceptInviteForm` is used on the public `/accept-invite` page — it's the one place in `team` consumed outside an authenticated page, since the invitee doesn't have an account yet.

### `features/platform-admin`
Exports: `OrganizationApprovalList`.

Only used by `/platform-admin/organizations`. Lists organizations with `status: PENDING` and Approve/Reject buttons per row; both mutations invalidate the pending-organizations query key. This feature is unrelated to any org's own roles — it's gated purely by `session.user.isPlatformAdmin`, which the frontend never sets itself (only the backend seed script grants it). See `ARCHITECTURE.md#organization-approval--platform-admin`.

## Shared layer (`shared/`)

- **`shared/api/httpClient.ts`** — the only place `fetch` is called directly. Attaches the `Authorization` header, sets `Content-Type: application/json` only when a body is present (see `ARCHITECTURE.md`/gotcha history), transparently retries once through `/api/auth/refresh` on a 401, and normalizes error responses into a typed `ApiError`.
- **`shared/components/ui/`** — design-system primitives (`Button`, `Input`, `Card`, etc.) with no domain knowledge; every feature's components are built from these.
- **`shared/lib/`** — cross-cutting utilities, e.g. `formatCurrency` (converts `*Cents` integers to a display string — this is the *only* place cents should be divided by 100 for display).

## Adding a new feature

1. Create `features/<name>/{api,hooks,components}` plus an `index.ts` barrel exporting only what other features/pages need.
2. Add fetch functions in `api/` using `shared/api/httpClient`, typed against the matching schema in `packages/shared`.
3. Wrap them in TanStack Query hooks in `hooks/` (`useX` for reads, `useCreateX`/`useUpdateX` for mutations) — mutations should invalidate their own query key and any other feature's query key they affect (export that key from the barrel if so, following `storeInventoryQueryKey`'s pattern).
4. Build components in `components/`, importing UI primitives from `shared/components/ui`.
5. Wire a page under `app/` that composes the components — keep the page itself free of fetch calls and business logic.
6. If a client component needs a *value* (not just a type) from `@pos/shared`, it will just work — `next.config.mjs`'s `extensionAlias` already handles the `.js`→`.ts` resolution (see `ARCHITECTURE.md` gotchas).
