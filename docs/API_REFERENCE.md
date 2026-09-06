# API Reference

Base URL: `http://localhost:4000` (dev). All request/response bodies are validated with `zod` schemas from `packages/shared`; import types from there rather than hand-rolling them.

## Conventions

- **Auth**: unless marked "public", every route requires `Authorization: Bearer <accessToken>`. `AuthGuard` decodes the token and scopes the request to `organizationId`.
- **Organization approval**: `AuthGuard` also rejects with `403 FORBIDDEN` any request whose organization isn't `APPROVED` yet, unless the user is a platform admin or the route is marked exempt (`GET /api/auth/me`, `GET /api/organizations/me`, and everything under `/api/platform/organizations`). See `ARCHITECTURE.md#organization-approval--platform-admin`.
- **Roles**: routes marked with a role list require `authContext.role` to be one of them (`RolesGuard` + `@Roles(...)`). No marking = any authenticated role.
- **Errors**: `{ "error": { "code": "NOT_FOUND", "message": "..." } }` with a matching HTTP status (400/401/403/404/409, or 500 for anything unexpected). See `ARCHITECTURE.md#errors`.
- **Money**: all `*Cents` fields are integers.
- **Store-scoped routes**: `:storeId` in the path — currently the frontend always uses the org's single store (see `DATA_MODEL.md#store`), but the API itself doesn't assume that.

## Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | public | `registerOrganizationRequestSchema` | Creates Organization + Store + owner User atomically (`AuthUnitOfWork`); returns a session (access token + user/org/store) and sets the refresh cookie. |
| POST | `/login` | public | `loginRequestSchema` | Verifies credentials, returns a session, sets the refresh cookie. |
| POST | `/refresh` | public (reads refresh cookie) | — | Issues a new access token. `200`. |
| POST | `/logout` | public | — | Clears the refresh cookie. |
| GET | `/me` | required | — | Returns the current session (user, organization, store). |

Refresh cookie: name `pos_refresh_token`, httpOnly, scoped to path `/api/auth`.

## Organizations — `/api/organizations`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | required (exempt from approval gate) | Returns the caller's organization, including `status`. |

## Platform admin — `/api/platform/organizations`

Requires `isPlatformAdmin: true` on the caller (`PlatformAdminGuard`); no `RolesGuard`/`@Roles()` involved since this is orthogonal to org-scoped roles. Used to review new organization signups.

| Method | Path | Body/Query | Description |
|---|---|---|---|
| GET | `/` | `?status=PENDING\|APPROVED\|REJECTED` (default `PENDING`) | Lists organizations in that status, each with the owner's name/email resolved from that org's members. |
| POST | `/:id/approve` | — | Sets status to `APPROVED` (stamps `approvedAt`). Only valid from `PENDING` — `409 Conflict` otherwise. |
| POST | `/:id/reject` | — | Sets status to `REJECTED` (stamps `rejectedAt`). Only valid from `PENDING` — `409 Conflict` otherwise. |

## Stores — `/api/stores`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | required | Lists the caller's organization's stores. |

## Users — `/api/users`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | required | OWNER/ADMIN/MANAGER | Lists all users in the organization (`orgMemberResponseSchema[]`). |

## Invites — `/api/invites`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | OWNER/ADMIN | — | Lists pending/accepted/revoked invites for the org. |
| POST | `/` | required | OWNER/ADMIN | `createInviteRequestSchema` | Creates an invite. Only an OWNER may invite role `OWNER`. Fails if a user with that email already exists, or a pending invite for that email already exists. |
| DELETE | `/:id` | required | OWNER/ADMIN | — | Revokes an invite. `204`. |
| GET | `/token/:token` | public | — | — | Fetches invite details (org name, role, email) for the accept page, before the invitee has an account. |
| POST | `/accept` | public | — | `acceptInviteRequestSchema` | Creates the User and marks the invite ACCEPTED atomically (`InvitesUnitOfWork`), then returns a session and sets the refresh cookie — the invitee is logged in immediately. `201`. |

## Categories — `/api/categories`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists categories. |
| POST | `/` | required | OWNER/ADMIN/MANAGER | `createCategoryRequestSchema` | Creates a category. |

## Products — `/api/products`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists products (with category). |
| GET | `/barcode/:barcode` | required | any | — | Looks up one product by barcode, scoped to the caller's org. `404` if not found. Used by the checkout barcode scanner. |
| POST | `/` | required | OWNER/ADMIN/MANAGER | `createProductRequestSchema` | Creates a product. |
| PATCH | `/:id` | required | OWNER/ADMIN/MANAGER | `updateProductRequestSchema` | Updates a product. |
| DELETE | `/:id` | required | OWNER/ADMIN/MANAGER | — | Deletes a product. `204`. Returns `409 Conflict` if the product has inventory/movement/sale history. |

## Inventory — `/api/stores/:storeId/inventory`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists inventory items (with product) for the store. |
| POST | `/adjustments` | required | OWNER/ADMIN/MANAGER | `adjustStockRequestSchema` | Manual stock adjustment; records an `ADJUSTMENT` `StockMovement` atomically (`InventoryUnitOfWork`). |
| PATCH | `/:productId/reorder-threshold` | required | OWNER/ADMIN/MANAGER | `setReorderThresholdRequestSchema` | Sets the low-stock alert threshold for a product at this store. |

## Sales (Checkout) — `/api/stores/:storeId/sales`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists sales (with line items) for the store. |
| POST | `/` | required | any (incl. CASHIER) | `createSaleRequestSchema` | Creates a sale atomically (`SalesUnitOfWork`): decrements inventory per line item, records `SALE` stock movements, applies an optional discount code (clamped so total ≥ 0), charges via the configured `PaymentProvider`, and persists the sale + line items. |

## Reports — `/api/stores/:storeId/reports`

All routes require OWNER/ADMIN/MANAGER.

| Method | Path | Query params | Description |
|---|---|---|---|
| GET | `/sales-summary` | `days` (default 7, max 365) | Aggregated revenue/sale-count over the window. |
| GET | `/top-products` | `days` (default 30, max 365), `limit` (default 5, max 50) | Best-selling products by quantity/revenue. |
| GET | `/low-stock` | — | Inventory items at or below their `reorderThreshold`. |

## Suppliers — `/api/suppliers`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists suppliers. |
| POST | `/` | required | OWNER/ADMIN/MANAGER | `createSupplierRequestSchema` | Creates a supplier. |

## Purchase orders — `/api/stores/:storeId/purchase-orders`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists purchase orders (with supplier + line items). |
| POST | `/` | required | OWNER/ADMIN/MANAGER | `createPurchaseOrderRequestSchema` | Creates a PO with status `ORDERED`. |
| POST | `/:purchaseOrderId/receive` | required | OWNER/ADMIN/MANAGER | `receivePurchaseOrderRequestSchema` — `{ lineItems: [{ lineItemId, quantityReceived }] }` | Receives some or all of the ordered quantity per line item (partial receiving supported). Validates each `quantityReceived` against the remaining amount before committing. Atomically (`PurchaseOrdersUnitOfWork`) increments inventory, records `RECEIVE` stock movements, and updates each line item's cumulative `quantityReceived`. Sets status to `RECEIVED` (with `receivedAt`) once every line item is fully received, otherwise `PARTIALLY_RECEIVED`. |
| POST | `/:purchaseOrderId/cancel` | required | OWNER/ADMIN/MANAGER | — | Cancels a PO. Only allowed while status is `ORDERED`. |

## Customers — `/api/customers`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists customers. |
| POST | `/` | required | any | `createCustomerRequestSchema` | Creates a customer (used for the checkout inline quick-create). |

## Discounts — `/api/discounts`

| Method | Path | Auth | Roles | Body | Description |
|---|---|---|---|---|---|
| GET | `/` | required | any | — | Lists discount codes. |
| POST | `/` | required | OWNER/ADMIN/MANAGER | `createDiscountRequestSchema` | Creates a discount code (`PERCENTAGE` 1–100 or `FIXED` cents). |

## Payments

There is no standalone payments HTTP endpoint — checkout (`POST .../sales`) calls the injected `PaymentProvider` internally. The shipped `MockPaymentProvider` always succeeds and returns a fake reference. To integrate a real gateway, implement the `PaymentProvider` interface (`modules/payments`) and rebind the `PAYMENT_PROVIDER` DI token in `PaymentsModule` — no controller or schema changes needed.
