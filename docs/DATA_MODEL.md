# Data Model

Source of truth: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma). This document is a readable companion to it, grouped by domain area. All IDs are `cuid()` strings. Money fields are always integer cents.

## Enums

| Enum | Values |
|---|---|
| `Role` | `OWNER`, `ADMIN`, `MANAGER`, `CASHIER` |
| `StockMovementType` | `RECEIVE`, `SALE`, `ADJUSTMENT` |
| `PaymentMethod` | `CASH`, `CARD` |
| `PurchaseOrderStatus` | `ORDERED`, `PARTIALLY_RECEIVED`, `RECEIVED`, `CANCELLED` |
| `DiscountType` | `PERCENTAGE`, `FIXED` |
| `InviteStatus` | `PENDING`, `ACCEPTED`, `REVOKED` |
| `OrganizationStatus` | `PENDING`, `APPROVED`, `REJECTED` |

## Tenancy & identity

### Organization
The tenant root. Every other model (except line-item children scoped through a parent) has an `organizationId` foreign key back here.

| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| name | String | |
| slug | String | `@unique` |
| status | OrganizationStatus | `@default(PENDING)` — a new organization cannot be used until a platform admin approves it. See [`docs/ARCHITECTURE.md#organization-approval--platform-admin`](ARCHITECTURE.md#organization-approval--platform-admin). |
| approvedAt / rejectedAt | DateTime? | both nullable, set by the platform-admin review action |
| createdAt / updatedAt | DateTime | |

Has-many: `Store`, `User`, `Category`, `Product`, `InventoryItem`, `StockMovement`, `Sale`, `Supplier`, `PurchaseOrder`, `Customer`, `Discount`, `Invite`.

### Store
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK → Organization, indexed |
| name | String | |
| address | String? | nullable |
| createdAt / updatedAt | DateTime | |

Has-many: `InventoryItem`, `StockMovement`, `Sale`, `PurchaseOrder`. **Note**: the current frontend only ever operates on the org's first store (no store switcher yet), but the schema and every backend endpoint already support multiple stores per organization.

### User
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK → Organization, indexed |
| email | String | `@unique` **globally** (not per-org) |
| passwordHash | String | bcrypt |
| firstName / lastName | String | |
| role | Role | |
| isPlatformAdmin | Boolean | `@default(false)` — not settable via any API; only granted by the `prisma/seed.ts` script or direct DB access. Bypasses both role checks scoped to their own org and the organization-approval gate entirely. |
| createdAt / updatedAt | DateTime | |

Has-many: `Sale` (as the cashier who recorded it).

### Invite
Token-based team invite (see [`docs/API_REFERENCE.md`](API_REFERENCE.md#invites) for the accept flow).

| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK → Organization, indexed |
| email | String | |
| role | Role | role the invitee will get |
| token | String | `@unique`, random 32-byte hex |
| status | InviteStatus | `@default(PENDING)` |
| expiresAt | DateTime | 7 days from creation |
| acceptedAt | DateTime? | nullable, set on acceptance |
| createdAt | DateTime | no `updatedAt` |

## Catalog & inventory

### Category
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| name | String | |
| createdAt / updatedAt | DateTime | |

`@@unique([organizationId, name])`. Has-many: `Product`.

### Product
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| categoryId | String? | nullable FK → Category, indexed |
| sku | String | |
| name | String | |
| description | String? | nullable |
| barcode | String? | nullable |
| priceCents | Int | |
| createdAt / updatedAt | DateTime | |

`@@unique([organizationId, sku])`. Has-many: `InventoryItem`, `StockMovement`, `SaleLineItem`, `PurchaseOrderLineItem`. A product with any inventory/movement history **cannot be deleted** — the repository translates the FK-violation into a 409 Conflict (see `ARCHITECTURE.md` error section).

### InventoryItem
Per-store stock level for a product.

| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| storeId | String | FK → Store, indexed |
| productId | String | FK → Product |
| quantity | Int | `@default(0)` |
| reorderThreshold | Int | `@default(0)` — set via `PATCH .../reorder-threshold`, drives the low-stock report |
| createdAt / updatedAt | DateTime | |

`@@unique([storeId, productId])` — one row per store+product pair, upserted by quantity/threshold updates.

### StockMovement
Immutable audit log of every quantity change (no `updatedAt` — rows are never edited).

| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| storeId | String | FK → Store |
| productId | String | FK → Product |
| type | StockMovementType | `RECEIVE` (from a PO), `SALE` (checkout), `ADJUSTMENT` (manual) |
| quantityChange | Int | signed — positive for receiving, negative for sales |
| note | String? | nullable, e.g. `"Received from purchase order <id>"` |
| createdAt | DateTime | |

`@@index([storeId, productId])`.

## Sales

### Sale
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| storeId | String | FK → Store, indexed |
| userId | String | FK → User (the cashier) |
| customerId | String? | nullable FK → Customer, indexed |
| discountId | String? | nullable FK → Discount |
| paymentMethod | PaymentMethod | |
| paymentReference | String? | transaction ID from the payment provider |
| subtotalCents | Int | `@default(0)` — sum of line totals before discount |
| discountCents | Int | `@default(0)` — amount actually deducted (clamped ≤ subtotal) |
| totalCents | Int | subtotal − discount; what was actually charged |
| createdAt | DateTime | no `updatedAt` — sales are immutable once created |

Has-many: `SaleLineItem`.

### SaleLineItem
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| saleId | String | FK → Sale, indexed |
| productId | String | FK → Product |
| quantity | Int | |
| unitPriceCents | Int | snapshot of the product's price **at time of sale** (never re-derived later) |
| lineTotalCents | Int | `unitPriceCents * quantity` |

No `organizationId` — scoped transitively through `Sale`.

## Purchasing

### Supplier
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| name | String | |
| contactEmail / contactPhone | String? | both nullable |
| createdAt / updatedAt | DateTime | |

Has-many: `PurchaseOrder`.

### PurchaseOrder
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| storeId | String | FK → Store, indexed |
| supplierId | String | FK → Supplier |
| status | PurchaseOrderStatus | `@default(ORDERED)` |
| totalCostCents | Int | sum of line items at creation time |
| receivedAt | DateTime? | nullable — set only when status reaches `RECEIVED` (not on partial receipt) |
| createdAt / updatedAt | DateTime | |

Has-many: `PurchaseOrderLineItem`. Status lifecycle: `ORDERED → PARTIALLY_RECEIVED → RECEIVED`, or `ORDERED → CANCELLED`. Cancellation is only allowed from `ORDERED` (not after any receiving has happened).

### PurchaseOrderLineItem
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| purchaseOrderId | String | FK → PurchaseOrder, indexed |
| productId | String | FK → Product |
| quantityOrdered | Int | |
| quantityReceived | Int | `@default(0)` — cumulative across possibly multiple partial receipts |
| unitCostCents | Int | |

No `organizationId` — scoped transitively through `PurchaseOrder`.

## Customers & discounts

### Customer
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| firstName / lastName | String | |
| email / phone | String? | both nullable |
| createdAt / updatedAt | DateTime | |

Has-many: `Sale`.

### Discount
| Field | Type | Notes |
|---|---|---|
| id | String | PK |
| organizationId | String | FK, indexed |
| code | String | |
| type | DiscountType | `PERCENTAGE` (value is 1–100) or `FIXED` (value is cents) |
| value | Int | interpretation depends on `type` |
| active | Boolean | `@default(true)` — no expiry date or usage-count limit exists yet |
| createdAt / updatedAt | DateTime | |

`@@unique([organizationId, code])`. Has-many: `Sale`. Discount math (see `CreateSaleUseCase`): the computed discount is always clamped to `min(discount, subtotal)` so a sale total can never go negative.

## Entity-relationship summary

```
Organization ──┬── Store ──┬── InventoryItem ── Product ── Category
               │           ├── StockMovement
               │           ├── Sale ──┬── SaleLineItem ── Product
               │           │          ├── User (cashier)
               │           │          ├── Customer (optional)
               │           │          └── Discount (optional)
               │           └── PurchaseOrder ──┬── Supplier
               │                                └── PurchaseOrderLineItem ── Product
               ├── User
               ├── Category ── Product
               ├── Customer
               ├── Discount
               ├── Supplier
               └── Invite
```
