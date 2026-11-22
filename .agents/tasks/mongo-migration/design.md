# Design: Migrate Frontend Business Data from localStorage to MongoDB

> Revision 2 — addresses all findings from the first design review (`design-review.md` /
> `design-verdict.json`). Finding responses are in §12.

## 1. Overview

This design replaces **all** localStorage/sessionStorage usage for business data across **every admin and sales page** with MongoDB-backed API calls through the NestJS backend. Today the backend runs on PostgreSQL via TypeORM (`useMongoDb()` is false because `.env` has no `MONGODB_URI`), and every existing service module injects TypeORM repositories. The Mongoose schemas under `backend/src/schemas/` (`transaction`, `item`, `customer`, `payment`, `refund`) already exist but are **dead code** — no module imports or registers them.

The decisive architectural choice is a **dual-database** backend: keep TypeORM + PostgreSQL for auth/users/roles (so JWT login keeps working unchanged) and add Mongoose + MongoDB as the sole store for migrated business data. The existing TypeORM controllers for `/transactions`, `/items`, `/payments`, `/approvals`, `/customers`, `/chat` are relational and tightly coupled to customer/item/user FKs; repointing the frontend at them would require a working local Postgres or a large rewrite and would not satisfy the "MongoDB only" goal. Instead we build a clean, parallel set of Mongoose-backed modules under new route namespaces and point the frontend at them. This avoids touching the working auth path and keeps the change additive and reversible.

Business data is consolidated into four Mongoose collections — `Transaction`, `Upload`, `Item`, `ChatMessage` — plus one small `Expense` collection (justified in §11). A single `Transaction` collection unifies what the frontend currently spreads across localStorage keys (`confirmed_transactions`, `payment_requests`, `shop_payment_requests`, `approved_refunds`, `approvals_data`), distinguished by `type`, `status`, and `source`. **Rejected transactions are not a separate key** — they are a derived view of `confirmed_transactions` filtered by status (N1) and exposed via `GET /api/txn/rejected`.

A critical contract decision: the `Transaction` document exposes **both** a capital `status` (`'Approved'|'Pending'|'Rejected'`) and a lowercase `approvalStatus` (`'approved'|'pending'|'rejected'`), populated together on create/approve/reject. The existing frontend compares against *both* fields across different pages (admin dashboard/customers/payments use lowercase `approvalStatus`; admin approvals uses capital `status`; admin payments uses both), so returning both lets each page keep its existing comparison logic untouched — the migration truly becomes "swap the source, keep the logic" (F7).

**Locked technology stack:**
- Backend: NestJS + `@nestjs/mongoose` (^10) + `mongoose` (^7) — already installed. PostgreSQL stays for auth via `@nestjs/typeorm` + `typeorm`.
- Frontend: Next.js 14 + `axios` (already used in `src/lib/api.ts`).
- Auth: unchanged TypeORM/PostgreSQL + Passport JWT.
- Backend port: 3002 (`.env` `PORT=3002`).
- API base: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api` — the *runtime* value is `http://localhost:3002/api` because `frontend/.env.local` and `next.config.js` set `NEXT_PUBLIC_API_URL=http://localhost:3002`. The literal fallback in `api.ts` code is `3001`; the env override resolves to `3002` (N4).

## 2. Existing Backend Modules — Extend vs. Create

| Data type | Existing module | Current store | Decision |
|---|---|---|---|
| Transactions (payments/credits/refunds/approvals) | `modules/transactions` (TypeORM, FK-heavy) | PostgreSQL | **Create new** `modules/txn` Mongoose module. Leave old `transactions` module mounted at `/transactions` (used by `admin/uploads` Excel bulk import, out of scope). |
| Customers / Excel uploads | `modules/uploads` (TypeORM `UploadsController` mounted at `/uploads`) | PostgreSQL + filesystem | **Create new** `modules/customer-uploads` Mongoose module for raw customer-row persistence. |
| Items | `modules/items` (TypeORM `ItemsController` mounted at `/items`) | PostgreSQL | **Create new** `modules/inventory` Mongoose module. |
| Chat | `modules/chat` (TypeORM `ChatController` mounted at `/chat`) | PostgreSQL | **Create new** `modules/messaging` Mongoose module. |
| Approvals / Payments | `modules/approvals`, `modules/payments` (TypeORM) | PostgreSQL | **Not used by frontend migration.** Admin approval/reject of a transaction is implemented as `PATCH /api/txn/:id/approve|reject` on the new Transaction collection. |
| Customers (relational) | `modules/customers` (TypeORM) | PostgreSQL | Unchanged; the sales customer-search dropdown still calls `/customers` from Postgres. This is lookup data, not migrated business data. |
| Expenses | none | — | **Create new** `modules/expenses` Mongoose module (justified §11). |

Rationale for new route namespaces: the existing controllers are registered at `/transactions`, `/items`, `/uploads`, `/chat` under the global `/api` prefix (`main.ts`). Adding Mongoose handlers to the same controllers would collide and mix two persistence models. New controllers at distinct routes keep things clean and avoid any collision with the legacy controllers, which remain mounted for Excel import and other out-of-scope features.

**Final new routes (correcting F2):** `/api/txn`, `/api/inventory`, `/api/customer-uploads`, `/api/messaging`, `/api/expenses`.

## 3. Mongoose Schemas

Schemas live in `backend/src/schemas/`. Per N6, the disposition of each schema file is stated explicitly:

- `transaction.schema.ts` — **rewritten** (today it is the dead-code original with `customerId`/`paymentId` FK refs to other Mongo collections; rewritten to be self-contained, add `userId`, `source`, `customerData`, audit fields, and the dual status fields the frontend needs).
- `item.schema.ts` — **rewritten** (add `userId`, `priceHistory`, keep `name`/`category`/`stock`/`price`/`isActive`).
- `upload.schema.ts` — **new file**.
- `chat-message.schema.ts` — **new file**.
- `expense.schema.ts` — **new file** (§11).
- `customer.schema.ts`, `payment.schema.ts`, `refund.schema.ts` — **left untouched as dead code.** They are not imported anywhere; deleting them is optional cleanup out of scope for this migration (N6). They are not registered and cause no harm.

Each schema is registered via `MongooseModule.forFeature` inside its own module (see §5 for connection wiring).

### 3.1 Transaction — `schemas/transaction.schema.ts` (rewrite)

```ts
@Schema({ timestamps: true })            // gives createdAt, updatedAt
export class Transaction {
  @Prop({ required: true, index: true }) userId: string;          // string form of auth user id (matches JWT sub)
  @Prop({ required: true }) customerName: string;
  @Prop({ type: Object, default: {} }) customerData: Record<string, any>;  // full Excel row, flexible
  @Prop({ required: true }) amount: number;
  @Prop() bank?: string;
  @Prop({ required: true, enum: ['Payment','Credit','Refund'], default: 'Payment' }) type: string;
  // DUAL status contract (F7): both fields populated together on create/approve/reject.
  @Prop({ required: true, enum: ['Approved','Pending','Rejected'], default: 'Pending', index: true }) status: string;
  @Prop({ required: true, enum: ['approved','pending','rejected'], default: 'pending', index: true }) approvalStatus: string;
  @Prop() rejectionReason?: string;
  @Prop({ enum: ['warehouse','shop'], default: 'warehouse', index: true }) source: string;
  @Prop({ type: [Object], default: [] }) items: Array<{ name?: string; itemName?: string; quantity: number; price: number; total: number; category?: string }>;
  @Prop() reference?: string;
  @Prop() reason?: string;
  @Prop() paymentNotes?: string;
  @Prop() additional?: string;
  @Prop({ type: [Object], default: [] }) additionalBanks?: Array<{ bank: string; amount: string; reason: string }>;
  @Prop() requestedBy?: string;
  @Prop({ type: Date }) approvedAt?: Date;  @Prop() approvedBy?: string;
  @Prop({ type: Date }) rejectedAt?: Date;  @Prop() rejectedBy?: string;
  @Prop({ default: false }) isRefund?: boolean;
}
```

The dual `status`/`approvalStatus` is the F7 fix. Both fields are written atomically in the service for every status transition:
- create: `status='Pending'`, `approvalStatus='pending'`
- approve: `status='Approved'`, `approvalStatus='approved'`, `approvedAt/approvedBy` set
- reject: `status='Rejected'`, `approvalStatus='rejected'`, `rejectedAt/rejectedBy` + `rejectionReason` set

Because both fields exist, each admin page keeps its existing comparison exactly:
- `admin/page.tsx`, `admin/customers/page.tsx`, `admin/payments/page.tsx` filter on `approvalStatus === 'approved'|'pending'` → still works.
- `admin/approvals/page.tsx` maps a pending transaction into its `Approval` object with `status: 'Pending'` then compares `approval.status === 'Pending'|'Approved'|'Rejected'` → works because the API returns the capital `status`.
- `admin/payments/page.tsx` uses both fields → works.

Indexes: `{ userId: 1, status: 1 }`, `{ source: 1, approvalStatus: 1 }`, `{ createdAt: -1 }`. `userId` is stored as **string** so it is agnostic to whether the auth user id is a Postgres serial integer or a Mongo ObjectId; this keeps the JWT `sub` (a number today) directly usable via `String(request.user.id)`.

This single collection replaces `confirmed_transactions` (status Pending/Approved), `payment_requests` (status pending, source warehouse), `shop_payment_requests` (source shop), `approved_refunds` (type Refund, status Approved), and `approvals_data` (a derived view of pending requests — not stored separately anymore). **Rejected transactions** are a derived view of this same collection where `approvalStatus='rejected'`, exposed via `GET /api/txn/rejected` (N1 — no separate `rejected_transactions` key exists in the frontend).

### 3.2 Upload — `schemas/upload.schema.ts` (new file)

```ts
@Schema({ timestamps: true })            // createdAt serves as uploadedAt
export class Upload {
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true }) fileName: string;
  @Prop({ required: true, enum: ['customers','items','transactions'] }) dataType: string;  // widened (N3)
  @Prop({ type: [Object], default: [] }) customers: Array<Record<string, any>>;
  @Prop({ type: [Object], default: [] }) items: Array<Record<string, any>>;
  @Prop({ type: [Object], default: [] }) transactions: Array<Record<string, any>>;
  @Prop() totalCount?: number;
}
```

`customers`/`items`/`transactions` are plain-object arrays so varying Excel columns are preserved exactly (the "flexible document storage" requirement). Index `{ userId: 1, createdAt: -1 }`. Replaces `uploaded_customers_persist` (customer Excel rows) and `uploaded_sales_items` (shop item Excel rows, `dataType: 'items'`).

### 3.3 Item — `schemas/item.schema.ts` (rewrite)

```ts
@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, index: true }) name: string;
  @Prop({ required: true, default: 'General' }) category: string;
  @Prop({ required: true, default: 0 }) stock: number;
  @Prop({ required: true }) price: number;
  @Prop({ default: true }) isActive: boolean;
  @Prop({ type: [Object], default: [] }) priceHistory: Array<{ price: number; changedAt: Date }>;
  @Prop() description?: string;
  @Prop() sku?: string;
}
```

Index `{ name: 1, category: 1 }`. Replaces `dashboard_items`. (`shop_items` is a dead key — N2 — see §7.5.) `priceHistory` is appended on every `PATCH /api/inventory/:id` that changes price.

**Duplicate handling (the user's reported bug):** adding an item whose `name` already exists does **not** create a second row — the existing item's `stock` is incremented by the new quantity and a `priceHistory` entry records the new price. This directly fixes "Samsung S26 Ultra quantity 1 + Samsung S26 Ultra quantity 1 should show quantity 2." The existing item-details modal in `admin/customers` already displays item details; the API now returns `priceHistory` so the modal can show each price entry, fixing "show after click on item and display all that item details."

### 3.4 ChatMessage — `schemas/chat-message.schema.ts` (new file)

```ts
@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true, index: true }) conversationId: string;   // e.g. 'sales-admin'
  @Prop({ required: true, index: true }) senderId: string;          // user id (string)
  @Prop({ required: true }) senderRole: string;                     // 'sales' | 'admin'
  @Prop() senderName?: string;
  @Prop({ required: true }) message: string;
  @Prop({ default: 'text' }) messageType: string;
  @Prop({ default: false }) isRead: boolean;
  @Prop({ type: Date }) readAt?: Date;
  @Prop({ type: Date }) editedAt?: Date;
}
```

Replaces `chat_messages_storage` (admin/chat-admin) and `all_chats_storage` (admin/chat-admin conversations). Conversations are a derived view (distinct `conversationId` + last message), matching the existing TypeORM `ChatService.getUserConversations` pattern — not a separate collection. The sales chat page uses the fixed channel `'sales-admin'`; admin sees all channels.

### 3.5 Expense — `schemas/expense.schema.ts` (new file, §11)

```ts
@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) amount: number;
  @Prop() category?: string;
  @Prop() date?: string;            // ISO date the expense occurred
  @Prop({ default: false }) isPaid: boolean;
}
```

Replaces the `expenses` localStorage key used in `admin/page.tsx` and `admin/payments/page.tsx`.

## 4. API Endpoint Contracts

All under global prefix `/api`. All require `Authorization: Bearer <token>`. Request bodies are JSON. Ids in paths are Mongo `_id` strings. On success return the saved/updated document (Mongoose, with `_id`, `createdAt`, `updatedAt`).

**Authorization (F9):** every route uses `@UseGuards(JwtAuthGuard)` to authenticate. Admin-only routes additionally use `@UseGuards(JwtAuthGuard, RoleGuardClass)` together with `@Roles('admin')`. `@Roles('admin')` only sets the `'roles'` metadata; `JwtAuthGuard` (in `common/guards/auth.guard.ts`) does not read role metadata — it only checks the JWT and `@Public()`. Role enforcement is done by `RoleGuardClass` (`common/guards/role.guard.ts`), which reads the `'roles'` metadata and compares against `request.user.role.name`. **The guard pair `@UseGuards(JwtAuthGuard, RoleGuardClass)` must appear with `@Roles('admin')` on every admin-only route.** Stating this explicitly so it is not left to interpretation. `userId`/`senderId` on create are forced from `request.user.id` (never trusted from the body).

### 4.1 Transactions — `/api/txn` (new module `modules/txn`)

| Method | Path | Auth | Body / Query | Response |
|---|---|---|---|---|
| GET | `/api/txn` | **admin** (`@UseGuards(JwtAuthGuard, RoleGuardClass)` + `@Roles('admin')`) | `?status=&source=&type=&approvalStatus=` | `{ data: Transaction[], total }` all transactions (admin view) |
| GET | `/api/txn/my` | any user | `?status=&source=&approvalStatus=` | `{ data: Transaction[], total }` filtered by `userId`=current user |
| GET | `/api/txn/rejected` | any user | — | `{ data: Transaction[] }` where `userId`=me AND `approvalStatus='rejected'` |
| POST | `/api/txn` | any user | `CreateTransactionDto` (see §8) | created `Transaction` (`status='Pending'`, `approvalStatus='pending'`) |
| PATCH | `/api/txn/:id/approve` | **admin** | `{}` | updated doc, `status='Approved'`/`approvalStatus='approved'`, sets `approvedAt/approvedBy` |
| PATCH | `/api/txn/:id/reject` | **admin** | `{ rejectionReason }` (required, non-empty) | updated doc, `status='Rejected'`/`approvalStatus='rejected'`, sets `rejectedAt/rejectedBy` |
| PATCH | `/api/txn/:id` | any user (owner only) | `UpdateTransactionDto` (whitelisted, see §8/F8) | updated doc |
| DELETE | `/api/txn/:id` | **admin** | — | `{ id }` |

### 4.2 Uploads — `/api/customer-uploads` (new module `modules/customer-uploads`)

Mounted at `/api/customer-uploads` to avoid colliding with the existing TypeORM `UploadsController` at `/api/uploads` (F2).

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/customer-uploads` | **admin** | — | all uploads `{ data }` |
| GET | `/api/customer-uploads/my` | any user | — | uploads for current user `{ data }` |
| POST | `/api/customer-uploads` | any user | `{ fileName, dataType: 'customers'|'items'|'transactions', customers?, items?, transactions? }` (N3 widened) | created `Upload` |
| GET | `/api/customer-uploads/:id` | owner/admin | — | single upload |
| DELETE | `/api/customer-uploads/:id` | owner/admin | — | `{ id }` |

### 4.3 Items — `/api/inventory` (new module `modules/inventory`)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/inventory` | any user | `?page=&limit=` (defaults 1/1000) | `{ data: Item[], total, page, limit }` |
| GET | `/api/inventory/:id` | any user | — | `Item` |
| POST | `/api/inventory` | **admin** | `{ name, category?, stock?, price }` | created/merged `Item` (see duplicate rule §3.3) |
| PATCH | `/api/inventory/:id` | **admin** | partial `{ name?, category?, stock?, price? }` | updated `Item`; if `price` changed, pushes `priceHistory` |
| DELETE | `/api/inventory/:id` | **admin** | — | `{ id }` |

### 4.4 Chat — `/api/messaging` (new module `modules/messaging`)

| Method | Path | Auth | Body / Query | Response |
|---|---|---|---|---|
| GET | `/api/messaging/conversations` | any user | — | `{ data: [{ conversationId, lastMessage, unreadCount, totalMessages }] }` (scoped to user) |
| GET | `/api/messaging/messages/:conversationId` | any user | `?page=&limit=` | `{ data: ChatMessage[], total }` (oldest-first) |
| POST | `/api/messaging/messages` | any user | `{ conversationId, message, messageType? }` | created `ChatMessage` (`senderId`/`senderRole` from token) |
| POST | `/api/messaging/conversations/:conversationId/mark-read` | any user | — | `{ markedCount }` |
| GET | `/api/messaging/unread-count` | any user | — | `{ unreadCount }` |

`conversationId` is conventionally `'sales-admin'` for the single sales↔admin channel; the sales chat page uses that fixed id. `senderRole` is derived from `request.user.role.name`.

### 4.5 Expenses — `/api/expenses` (new module `modules/expenses`, §11)

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/expenses` | **admin** | — | `{ data: Expense[] }` |
| POST | `/api/expenses` | **admin** | `{ description, amount, category?, date?, isPaid? }` | created `Expense` |
| DELETE | `/api/expenses/:id` | **admin** | — | `{ id }` |

## 5. Dual TypeORM/Mongoose Wiring + JWT Preservation

**`app.module.ts` change (fixing F3 + F4):** the current code does an exclusive-or: when `MONGODB_URI` is set it registers only `MongooseModule.forRoot(dbConfig.uri)` and omits `TypeOrmModule.forRoot` and `TypeOrmModule.forFeature([User, Role])` — which would break every `@InjectRepository` in auth/users/customers/items/etc. We change it so both coexist when `MONGODB_URI` is set:

1. **Always register TypeORM with the PostgreSQL config**, regardless of `MONGODB_URI`. Introduce a new `getPostgresConfig()` that *always* returns the PostgreSQL TypeORM config (parsing `DATABASE_URL` or the individual `DB_*` env vars exactly as the existing `getDbConfig()` does in the Postgres branch). Do **not** pass the Mongo `{ uri }` object to TypeORM (F3 defect 1). `TypeOrmModule.forRoot(getPostgresConfig())` is registered unconditionally, and `TypeOrmModule.forFeature([User, Role])` in `app.module.ts` becomes unconditional (F3 defect 2) so the auth repositories always resolve. The existing `AuthModule`/`UsersModule`/etc. `TypeOrmModule.forFeature([...])` calls keep working.

2. **Register Mongoose only when `MONGODB_URI` is set**, and align the connection name (F3 defect 2): `MongooseModule.forRoot(process.env.MONGODB_URI, 'alem_crm')` so the named connection `'alem_crm'` exists. Each new module uses `MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }], 'alem_crm')` — the same `'alem_crm'` name in both `forRoot` and every `forFeature`, so `@InjectModel(Transaction.name)` binds.

3. **Import the four new Mongoose modules conditionally on `useMongoDb()`** (F4), matching the existing spread pattern (`...(isMongoDb ? [MongooseModule.forRoot(...)] : [])`). `MongooseModule.forFeature` cannot resolve `@InjectModel` without a registered connection — importing the modules unconditionally would crash bootstrap when `MONGODB_URI` is unset rather than "degrading gracefully." Therefore the four modules are imported via `...(isMongoDb ? [TxnModule, ItemsMongoModule, UploadsMongoModule, ChatMongoModule, ExpensesModule] : [])`. **This migration requires `MONGODB_URI` to be set;** the no-`MONGODB_URI` branch remains the legacy Postgres-only mode and is unsupported for the migrated features. The false "degrade gracefully" claim from rev 1 is removed.

Sketch of the `app.module.ts` imports change:
```ts
const isMongoDb = useMongoDb();
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([...]),
    // TypeORM (Postgres) — always on, for auth
    TypeOrmModule.forRoot(getPostgresConfig()),          // NEW: always Postgres
    TypeOrmModule.forFeature([User, Role]),              // NEW: unconditional (was mongo-gated)
    // Mongoose — only when MONGODB_URI set
    ...(isMongoDb ? [MongooseModule.forRoot(process.env.MONGODB_URI, 'alem_crm')] : []),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'your-secret-key', signOptions: { expiresIn: '1h' } }),
    ...existingTypeormModules...,                       // AuthModule, UsersModule, ... (unchanged)
    // New Mongoose modules — only when MONGODB_URI set
    ...(isMongoDb ? [TxnModule, ItemsMongoModule, UploadsMongoModule, ChatMongoModule, ExpensesModule] : []),
  ],
  ...
})
```

**`.env` updates (implementation step, flagged here):** add to `backend/.env`:
```
MONGODB_URI=<user's MongoDB Atlas/local connection string>
DB_NAME=alem_crm
```
The user must supply the connection string (`.env.mongodb` is a placeholder template). Its `MONGODB_URI`/`DB_NAME` lines are copied into `.env` once the user provides a real URI.

**JWT preservation:** `JwtStrategy.validate` calls `usersService.findById(payload.sub)` (TypeORM, `relations: ['role']`) and returns the full user onto `request.user`; `@CurrentUser()` returns `request.user`; `request.user.id` (number) and `request.user.role.name` (string) are valid. Keeping auth on Postgres preserves this unchanged. The frontend keeps `token` and `user` (and the auth-adjacent `userRole`/`userFullName` mirrors) in localStorage for auth/role checks only — every business-data API call sends `Authorization: Bearer <token>`. No business data is written to localStorage.

## 6. Frontend Shared API Utility — `frontend/src/lib/api.ts`

`api.ts` already exists with an axios instance (`baseURL = API_URL_WITH_PATH` where `API_URL_WITH_PATH = ${API_BASE_URL}/api`), a request interceptor that injects `Bearer` from `localStorage.getItem('token')`, and a 401 response interceptor that clears `token` and redirects to `/login`. We **extend it in place** (no new file) by adding domain API objects that the pages import. Existing exports (`authAPI`, `customersAPI`, `itemsAPI`, `paymentsAPI`, etc.) remain untouched.

Note on the base fallback (N4): the literal code fallback is `http://localhost:3001`, but the *runtime* value is `http://localhost:3002` because `frontend/.env.local` and `next.config.js` set `NEXT_PUBLIC_API_URL=http://localhost:3002`. Functionally fine (env is set in this project); the runtime base depends on `NEXT_PUBLIC_API_URL`.

```ts
// existing api instance reused; interceptors unchanged

export const txnAPI = {
  all: (params?: { status?: string; source?: string; type?: string; approvalStatus?: string }) =>
    api.get('/txn', { params }),
  mine: (params?: { status?: string; source?: string; approvalStatus?: string }) =>
    api.get('/txn/my', { params }),
  rejected: () => api.get('/txn/rejected'),
  create: (data: CreateTransactionPayload) => api.post('/txn', data),
  approve: (id: string) => api.patch(`/txn/${id}/approve`),
  reject: (id: string, rejectionReason: string) => api.patch(`/txn/${id}/reject`, { rejectionReason }),
  update: (id: string, data: UpdateTransactionPayload) => api.patch(`/txn/${id}`, data),  // whitelisted DTO (F8)
  remove: (id: string) => api.delete(`/txn/${id}`),
};

export const inventoryAPI = {
  list: (page = 1, limit = 1000) => api.get('/inventory', { params: { page, limit } }),
  get: (id: string) => api.get(`/inventory/${id}`),
  create: (data: { name: string; category?: string; stock?: number; price: number }) =>
    api.post('/inventory', data),
  update: (id: string, data: any) => api.patch(`/inventory/${id}`, data),
  remove: (id: string) => api.delete(`/inventory/${id}`),
};

export const customerUploadsAPI = {
  all: () => api.get('/customer-uploads'),
  mine: () => api.get('/customer-uploads/my'),
  // dataType widened to 'customers'|'items'|'transactions' (N3)
  save: (data: {
    fileName: string;
    dataType: 'customers' | 'items' | 'transactions';
    customers?: any[]; items?: any[]; transactions?: any[];
  }) => api.post('/customer-uploads', data),
  get: (id: string) => api.get(`/customer-uploads/${id}`),
  remove: (id: string) => api.delete(`/customer-uploads/${id}`),
};

export const messagingAPI = {
  conversations: () => api.get('/messaging/conversations'),
  messages: (conversationId: string, page = 1, limit = 50) =>
    api.get(`/messaging/messages/${conversationId}`, { params: { page, limit } }),
  send: (data: { conversationId: string; message: string; messageType?: string }) =>
    api.post('/messaging/messages', data),
  markRead: (conversationId: string) =>
    api.post(`/messaging/conversations/${conversationId}/mark-read`),
  unreadCount: () => api.get('/messaging/unread-count'),
};

export const expensesAPI = {           // §11
  list: () => api.get('/expenses'),
  create: (data: { description: string; amount: number; category?: string; date?: string; isPaid?: boolean }) =>
    api.post('/expenses', data),
  remove: (id: string) => api.delete(`/expenses/${id}`),
};
```

**Auth-header injection:** already handled by the request interceptor. No change.

**Error/loading handling contract:** each API call returns a promise that rejects with an axios error on failure. Pages wrap calls in try/catch and set a local `error` state shown inline (a small banner) without crashing. The existing 401 interceptor preserves "token expired → /login." Network errors (backend down) are caught and surfaced as "Couldn't reach the server" — pages must **not** fall back to localStorage; they show the empty state with a retry button. A tiny shared helper standardizes this:

```ts
export async function safeApi<T>(p: Promise<{ data: T }>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try { return { ok: true, data: (await p).data }; }
  catch (e: any) { return { ok: false, error: e?.response?.data?.message || e?.message || 'Request failed' }; }
}
```

Inter-tab sync currently uses `window.dispatchEvent` + `storage` events; we replace that with a re-fetch of the relevant API after each mutation (simpler, no event plumbing) — the source of truth is now server-side.

## 7. Per-Page Migration Plan

Scope is **all admin and sales pages** — not just the original nine. Exploration found three real sales pages with business localStorage data that rev 1 omitted (F1): `sales/customers-balance`, `sales/shop-requests`, `sales/payment-requests`. The full list below is twelve pages: the original nine plus these three. For each page: the localStorage keys removed, the API calls that replace them, and loading/error handling. UI/styling is **not** changed — only data-source lines are swapped. Each page already has a `loading` state; we reuse it. Errors render as a small inline banner; empty results render the existing empty state.

**Reachability note (F1):** `sales/shop-requests`, `sales/payment-requests`, and `sales/customers-balance` are reachable routes under `/sales/...`. They hold live business data and are migrated below rather than deleted.

### 7.1 `sales/page.tsx` (Sales dashboard)
- `confirmed_transactions` (load + write + rejected filter) → `txnAPI.mine()` on mount and after every create; rejected subset via `txnAPI.rejected()`.
- `uploaded_customers_persist` (load + persist-on-change) → `customerUploadsAPI.mine()` on mount; the "persist on change" `useEffect` (~line 195) is removed — uploads are saved once via `customerUploadsAPI.save(...)` at the moment of Excel upload (already a user action), not on every keystroke.
- Creating a payment/credit/refund → `txnAPI.create(...)` instead of the `localStorage.setItem('confirmed_transactions', ...)` writes (~lines 2422, 2787, 3333).
- `user_email` read (~line 2764) → read from the `user` object in localStorage (auth, allowed) instead of the separate `user_email` key.
- Rejected-customer Excel-field lookup (~lines 1192–1255) currently re-reads `confirmed_transactions` to find the matching row's `customerData`. After migration the rejected transaction already carries `customerData` on it (the API stores it), so the lookup becomes `selectedRejectedTransaction.customerData` — no extra read.
- Loading: existing `loading` state drives the skeleton; API errors show inline banner.
- The "clear all data" button (~lines 4290–4302) that wipes localStorage is repurposed to call delete endpoints (or removed if out of scope); it must NOT wipe `token`/`user`.

### 7.2 `sales/shop/page.tsx`
- `dashboard_items` (load) → `inventoryAPI.list()`.
- `uploaded_sales_items` (load + write) → folded into the Upload collection (`dataType: 'items'`, `items: [...]`); load via `customerUploadsAPI.mine()` filtered to `dataType==='items'`, write via `customerUploadsAPI.save({ dataType: 'items', items })`. (`currentUser` reads, ~lines 191/377/2507 → read from `user` in localStorage, removing the legacy `currentUser` key.)
- `shop_payment_requests` (load + write) → `txnAPI.mine({ source: 'shop' })` load; new requests via `txnAPI.create({ source: 'shop', ... })`.
- `confirmed_transactions` writes (~lines 433, 2530) → `txnAPI.create(...)`.
- Loading/errors as above.
- **Cross-collection write for shop items:** the shop uploads Excel rows of items and immediately uses them as sellable stock. We store the upload AND, on save, upsert corresponding `Item` documents via `inventoryAPI.create` (which dedupes by name, fixing the quantity bug). The frontend calls `customerUploadsAPI.save` then loops `inventoryAPI.create` for each item. Kept client-side to avoid adding a server transaction; acceptable for the volumes here.

### 7.3 `sales/requests/page.tsx`
- `confirmed_transactions` (load + status-update write, ~lines 43–62) → `txnAPI.mine({ approvalStatus: 'pending' })` to load; cancel-request → `txnAPI.remove(id)` (owner can remove their own pending) or `txnAPI.update`. Load via `txnAPI.mine({ status: 'pending' })`.

### 7.4 `sales/chat/page.tsx`  *(rewritten — F6)*
- `user`/`token` reads (~lines 160–161) → kept (auth).
- **sales chat currently holds in-memory mock message arrays** (hardcoded mock arrays in component state) — it does **not** read `chat_messages_storage`/`all_chats_storage` (those keys are used only by `admin/chat-admin`, §7.11). The migration is therefore a *new persistence layer*, not a "replace the localStorage key" swap. On mount, replace the mock initialization with `messagingAPI.messages('sales-admin')`; send via `messagingAPI.send({ conversationId: 'sales-admin', message })`; poll every 5s (simple, matches existing complexity; the TypeORM `ChatGateway`/websocket exists but is Postgres-coupled and out of scope to rewire). Conversation list from `messagingAPI.conversations()`.
- Loading: a `messagesLoading` state; errors inline.

### 7.5 `admin/page.tsx` (Admin dashboard)
- Keys: `confirmed_transactions` (~95/312), `dashboard_items` (~199/237/410), `approved_refunds` (~457), `expenses` (~512), `payment_requests` (~544), `shop_items` (~559), `user`/`token` (~64–65 kept).
  - transactions → `txnAPI.all()`.
  - items → `inventoryAPI.list()`.
  - approved_refunds → `txnAPI.all({ type: 'Refund', approvalStatus: 'approved' })`.
  - payment_requests (warehouse pending) → `txnAPI.all({ approvalStatus: 'pending', source: 'warehouse' })`.
  - `shop_items` is a **dead key (N2)** — `admin/page.tsx` reads it as *pending shop requests* (filters by `status==='Pending'`, adds to `pendingRequestsCount`) and never writes it. Drop the `shop_items` load; source the dashboard's pending-shop count from `txnAPI.all({ source: 'shop', approvalStatus: 'pending' })` (the live shop-request data).
  - `expenses` → `expensesAPI.list()`.
- The "API fallback" block (~lines 373–407) that tries API then falls back to localStorage is removed — API is now the only source. The existing logic that filters `t.approvalStatus === 'approved'` works unchanged because the API returns `approvalStatus` (F7).

### 7.6 `admin/customers/page.tsx`
- `dashboard_items` (load ~1271, sync-on-change ~1318, writes ~1480/1494/1513/1636) → `inventoryAPI.list()` load; **remove the `useEffect` that writes to localStorage on every change**; item add/update/delete → `inventoryAPI.create/update/remove`. Duplicate-add merge rule (§3.3) fixes the user's quantity bug here.
- `confirmed_transactions` read (~1324) used to build the customer list from approved transactions → `txnAPI.all({ approvalStatus: 'approved' })` then build the customer map client-side as today (keeps existing `t.approvalStatus === 'approved'` logic, which works because the API returns `approvalStatus` — F7).
- `approved_refunds` (~60) → `txnAPI.all({ type: 'Refund', approvalStatus: 'approved' })`.

### 7.7 `admin/payments/page.tsx`  *(adds the F5 write)*
- Keys: `expenses` (~44), `approved_refunds` (~58), `payment_requests` (~113), `shop_payment_requests` (~207), `confirmed_transactions` (~346/419/475), `dashboard_items` (~374/407), `payment_requests` approve flows (~295–325, ~439–450), **and `uploaded_customers_persist` (~509/536) — F5**.
  - Load all pending → `txnAPI.all({ approvalStatus: 'pending' })`; split by source (warehouse vs shop) client-side, or call with `?source=`.
  - Approve a payment/credit → `txnAPI.approve(id)`; reject → `txnAPI.reject(id, reason)`. Removes all the `localStorage.setItem('confirmed_transactions'|'shop_payment_requests', ...)` syncs (~427, ~483, ~495).
  - Inventory decrement on approval (~374–407) → `inventoryAPI.update(itemId, { stock: newStock })`.
  - Refund approval moving rows between `payment_requests` and `approved_refunds` (~318–325) → single `txnAPI.approve(id)` flips status; no row-moving needed.
  - expenses → `expensesAPI`.
  - **F5: remove the `uploaded_customers_persist` read/write block (~lines 509–538)** ("Move rejected transaction back to uploaded_customers for re-editing"). The rejected transaction already carries `customerData` on the `Transaction` document, so sales reads it via `txnAPI.rejected()` and the move-back step is unnecessary. Removing it eliminates the last business-data `localStorage.setItem('uploaded_customers_persist', ...)` on this page.
  - Status badge logic uses both `status==='Approved'` and `approvalStatus==='pending'` — both returned by the API (F7), so unchanged.

### 7.8 `admin/approvals/page.tsx`
- `approvals_data` (~40–58, write ~128) and `payment_requests` (~62) → load pending transactions via `txnAPI.all({ approvalStatus: 'pending' })`. The page maps each pending transaction into its `Approval` object with `status: 'Pending'` then compares `approval.status === 'Pending'|'Approved'|'Rejected'`; the API returns the capital `status` field (F7), so this works. Approve/reject → `txnAPI.approve/reject`. The `MOCK_APPROVALS` seeding and `approvals_data` persistence are removed; the API is the source. `token` (~33) kept.

### 7.9 `sales/customers-balance/page.tsx`  *(F1 — newly added)*
- `confirmed_transactions` (load ~56; write ~192–193) → `txnAPI.mine()` on mount; create payment/refund → `txnAPI.create({ source, type, ... })` replacing the `setItem('confirmed_transactions', ...)` and `setItem('shop_payment_requests', ...)` writes (~192–197).
- `currentUser` read (~145) → read from the allowed `user` localStorage key (auth), removing the legacy `currentUser` key.
- `user_email` read (~1642, used as `requestedBy`) → read from `user.email` in localStorage (auth).
- `payment_requests` write (~1650–1652, refund request → warehouse requests) → `txnAPI.create({ source: 'warehouse', type: 'Refund', isRefund: true, ... })` replacing the `setItem('payment_requests', ...)` write.
- Loading: existing loading state; errors inline banner.

### 7.10 `sales/shop-requests/page.tsx`  *(F1 — newly added)*
- `shop_payment_requests` (load ~33 on mount, reload ~57 on the "shop payment rejected" event) → `txnAPI.mine({ source: 'shop' })` on mount and after each mutation; the custom `window` event listener is replaced by a re-fetch. No writes here (status changes flow through admin approvals); if a local cancel action exists, use `txnAPI.update/remove`. `token` kept.

### 7.11 `sales/payment-requests/page.tsx`  *(F1 — newly added)*
- `payment_requests` (load ~35) → `txnAPI.mine({ approvalStatus: 'pending' })` (or `txnAPI.mine({ source: 'warehouse', approvalStatus: 'pending' })`) to render the status-filtered list. `token` kept.

### 7.12 `admin/chat-admin/page.tsx`
- `STORAGE_KEY` (messages, ~94/104), `CHATS_KEY` (conversations, ~316/364), `user`/`token` (~158–159 kept) → `messagingAPI.messages(conversationId)`, `messagingAPI.conversations()`, `messagingAPI.send(...)`. Admin sees all conversations (one per sales channel `sales-admin`, or per user). Poll every 5s. Mark-read on open.

## 8. Edge Cases & Error Handling (concrete per operation)

**DTOs and validation (fixing F8):**
- `CreateTransactionDto`: `customerName` (required string), `amount` (required number > 0), `type` (enum Payment/Credit/Refund), `source` (enum warehouse/shop), `customerData` (optional object — flexible, no validation beyond object type), `items` (optional array), `bank`, `reference`, `reason`, `additionalBanks`, `additional`, `paymentNotes` (optional strings/arrays). Validated by the global `ValidationPipe` with `whitelist: true` so unknown properties are stripped.
- `UpdateTransactionDto` (F8): whitelists **only** mutable business fields — `customerName`, `customerData`, `items`, `bank`, `reference`, `reason`, `additionalBanks`, `paymentNotes`, `additional` — and **explicitly excludes** `status`, `approvalStatus`, `type`, `approvedBy/At`, `rejectedBy/At`, `isRefund`, `userId`, `source`. With `whitelist: true`, an owner attempting `PATCH { status: 'Approved' }` has that field stripped, so status transitions can only happen via the admin-only `/approve`|`/reject` endpoints. No self-approval is possible.
- `CreateExpenseDto`: `description` (required non-empty), `amount` (required number ≥ 0), `category`, `date`, `isPaid` (optional).

**DB connection failures:** `MongooseModule.forRoot` throws at bootstrap if `MONGODB_URI` is invalid/unreachable → app fails to start (fatal, logged by Nest bootstrap). If MongoDB drops after start, Mongoose auto-reconnects; in-flight operations reject with a MongoServerError → the controller lets it propagate as HTTP 500, the page shows "Couldn't reach the server" + retry. Recoverable at page level.

**POST /txn create — validation (owned by controller/service via ValidationPipe):**
- `amount`: required, number > 0. Failure → 400 `{ message: 'amount must be > 0' }`. Recoverable (caller shows form error).
- `customerName`: required, non-empty string. Failure → 400.
- `userId`: forced from `request.user.id`, never from body. If no user (unauth) → guard returns 401 before reaching service.
- `type`: enum Payment/Credit/Refund; invalid → 400.
- Excel `customerData`: arbitrary object; no field validation (flexible requirement) — only `customerName` validated.

**PATCH /txn/:id/approve & /reject — ownership/role (owned by guards + service):**
- Non-admin calling → `RoleGuardClass` returns 403 `{ message: 'Forbidden' }`. Logged at warn level in the guard.
- Unknown `id` → 404 `{ message: 'Transaction not found' }`.
- `reject` with empty/missing `rejectionReason` → 400. Non-recoverable until user supplies a reason.
- Approve on an already-approved doc → idempotent, returns current doc (no error). Reject on approved → 409 `{ message: 'Cannot reject an approved transaction' }` (recoverable).
- Owner PATCH on a doc the caller doesn't own (and isn't admin) → 403, owned by service (`doc.userId === String(request.user.id)` or admin role).

**Item duplicate add (the user's bug):** POST /inventory with existing `name` → service finds existing doc, `stock += quantity`, pushes `priceHistory { price, changedAt }`, returns merged doc (HTTP 200). Not an error. Frontend toast: "Added to existing item".

**Chat send:** `message` empty → 400. `conversationId` missing → 400. `senderId`/`senderRole` from token (not body).

**Upload save:** `customers`/`items`/`transactions` array empty → still accepted (records an empty upload) but `totalCount` 0; not an error. `dataType` enum enforced → invalid 400.

**401 handling:** response interceptor clears `token` and redirects to `/login` (existing). The page does not fall back to localStorage.

**Logging levels:** validation errors → not logged (expected client mistakes). 401/403 → warn. 500 (DB errors) → error with stack via Nest's default exception filter. All in the existing `Logger`.

**Invariants and the layer that owns each:**
- "A transaction's `userId` equals the authenticated user" → enforced in the service (set from `request.user.id`), never the body. Owner checks on update/delete compare `doc.userId === String(request.user.id)` or admin role — **service layer**, because the doc is loaded there.
- "Admin-only approve/reject" → enforced by `RoleGuardClass` at the **controller/guard layer**, using `@Roles('admin')` metadata.
- "Item name is unique (merge semantics)" → enforced in `ItemsMongoService.create` (find-or-merge). Not a DB unique index (we want merge, not conflict) — **service layer**.
- "Owner PATCH cannot change status/approval fields" → enforced by the `UpdateTransactionDto` whitelist + `whitelist: true` ValidationPipe — **DTO/validation layer** (F8).
- "No business data in localStorage" → enforced by code review + the §9 verification grep; no runtime invariant.

## 9. Testability

- **Unit tests** (`backend`, Jest): each new service method with a mocked `@InjectModel`. Test create/approve/reject status transitions (both `status` and `approvalStatus` set together), item dedupe/merge, conversation aggregation, role-guard allow/deny, owner-vs-admin PATCH, the 400/404/403 error paths, and that `UpdateTransactionDto` strips `status`/`approvalStatus` (F8). These need no DB.
- **Integration tests:** spin the new modules with an in-memory MongoDB. **`mongodb-memory-server` is NOT currently in `backend/package.json` (N5)** — list it as a devDependency to add (`npm i -D mongodb-memory-server`) before these integration tests can run. The tests then verify the Mongoose schema round-trips flexible Excel `customerData` objects and that `priceHistory` appends on price change.
- **Frontend:** the shared `api.ts` functions are thin axios wrappers — verified via the end-to-end manual checks in the brief (create transaction in UI → appears in MongoDB, approve updates status, rejected shows in sales dashboard, items persist, no localStorage business keys remain). A grep test (verification criterion) asserts no business localStorage calls remain.

**Verification grep (expanded per F10):** scope to **all** `frontend/src/app/admin/**/*.tsx` and `frontend/src/app/sales/**/*.tsx`, cover `localStorage.getItem` **and** `localStorage.setItem` **and** `localStorage.removeItem`, and assert the *only* keys referenced are the allowed auth/role keys: `token`, `user`, `userRole`, `userFullName`. The following business keys must produce **zero** matches: `confirmed_transactions`, `dashboard_items`, `uploaded_customers_persist`, `shop_payment_requests`, `payment_requests`, `rejected_transactions`, `chat_messages_storage`, `all_chats_storage`, `approved_refunds`, `expenses`, `shop_items`, `approvals_data`, `uploaded_sales_items`, `currentUser`, `user_email`. **Documented intentional exceptions (business keys intentionally retained, must be listed):** `admin/uploads` keeps `admin_sales_import_results` (Excel bulk-import result cache — that page is out of scope, not in the migrated set), and `admin/users` keeps `users_data` (user-account storage including plaintext passwords — a separate security fix, out of scope). Everything else is migrated.

## 10. Out of Scope

- Migrating auth/users to MongoDB — JWT auth stays on Postgres; `token`/`user` (and `userRole`/`userFullName` mirrors) remain in localStorage for auth/role only.
- `users_data` localStorage key (`admin/users` stores user accounts + plaintext passwords in localStorage) — auth/user-management, not business data, and a separate security fix. Flagged, not done here. Listed as a known exception in §9.
- `admin_sales_import_results` on `admin/uploads` — the Excel bulk-import result cache. Out of scope to migrate; that page is not in the migrated set. Listed as a known exception in §9.
- Rewiring the existing TypeORM websocket `ChatGateway` to Mongoose — the sales/admin chat uses HTTP polling, sufficient for this migration.
- The unrelated earlier feature requests in the original messages (mobile responsiveness, item-details modal polish, deploy) — already addressed in prior work; this design is the MongoDB migration only.

## 11. Notes on Brief Scope vs. Discovered Keys

The brief named seven business keys; exploration found more business keys actually used across admin and sales pages: `payment_requests`, `approved_refunds`, `expenses`, `shop_items` (dead — N2), `approvals_data`, `uploaded_sales_items`, plus the auth-adjacent `currentUser`/`user_email` duplicates, and the `uploaded_customers_persist` write in `admin/payments` (F5). To satisfy "no localStorage calls for business data remain," all are mapped: the five transaction-like keys fold into the `Transaction` collection; `shop_items` is dropped (dead) and its dashboard count sourced from `txnAPI.all({source:'shop',approvalStatus:'pending'})` (N2); `uploaded_sales_items` folds into `Upload` (+ `Item` upsert); `approvals_data` is a derived view removed in favor of `txnAPI.all({approvalStatus:'pending'})`; `currentUser`/`user_email` consolidate to the allowed `user` key; the `uploaded_customers_persist` write is removed (F5).

`expenses` is the one key with no natural home in the brief's four collections. Decision: add a minimal `Expense` Mongoose schema (`§3.5`) and three endpoints `GET/POST/DELETE /api/expenses`, exposed as `expensesAPI` in `api.ts`. This is a deliberate, flagged extension beyond the brief's enumerated endpoints, justified solely because the hard verification criterion requires zero business data in localStorage and expenses is business data. Backlogging it (keeping localStorage for expenses only) would fail the "no localStorage for business data" check, so this design implements it.

## 12. Responses to Design Review Findings

This revision addresses every finding from `design-review.md` / `design-verdict.json`:

- **F1 (HIGH) — omitted sales pages:** Added `sales/customers-balance` (§7.9), `sales/shop-requests` (§7.10), `sales/payment-requests` (§7.11) to the per-page plan with explicit key→API mappings and stated reachability. §1 and §7 now state the scope is "all admin and sales pages" (twelve pages, not nine). **Resolved.**
- **F7 (HIGH) — status field contract:** Chose option (a). The `Transaction` schema (§3.1) exposes **both** a capital `status` (`Approved`/`Pending`/`Rejected`) and a lowercase `approvalStatus` (`approved`/`pending`/`rejected`), populated together on create/approve/reject. The existing dead-code `transaction.schema.ts` already had both fields; the rewrite preserves them. Each affected §7 entry confirms the existing comparison logic works unchanged. The false "only swaps the source" overreach is corrected by stating the dual-field contract explicitly. **Resolved.**
- **F2 (MEDIUM) — route list conflict:** §2's final route list corrected to `/api/txn`, `/api/inventory`, `/api/customer-uploads`, `/api/messaging`, `/api/expenses`. §4.2 documents the `/api/customer-uploads` mount to avoid the `/api/uploads` collision. **Resolved.**
- **F3 (MEDIUM) — dual-DB wiring:** §5 now specifies a new `getPostgresConfig()` that always returns the PostgreSQL TypeORM config (never the Mongo `{ uri }` object); `TypeOrmModule.forRoot` and `TypeOrmModule.forFeature([User, Role])` are unconditional; Mongoose uses the named connection `'alem_crm'` in both `forRoot` and every `forFeature`. **Resolved.**
- **F4 (MEDIUM) — module inclusion:** §5 imports the new Mongoose modules conditionally on `useMongoDb()` (spread pattern) and explicitly states this migration requires `MONGODB_URI`; the "degrade gracefully" claim is removed. **Resolved.**
- **F5 (MEDIUM) — admin/payments uploaded_customers_persist write:** §7.7 adds an explicit instruction to remove the read/write block (~lines 509–538); rejected transactions carry `customerData` so the move-back is unnecessary. **Resolved.**
- **F6 (MEDIUM) — sales chat mischaracterized:** §7.4 rewritten to state sales chat holds in-memory mock messages (not `chat_messages_storage`); the migration adds a new persistence layer via `messagingAPI.messages('sales-admin')` + `send` + 5s poll. `admin/chat-admin` (§7.12) is unchanged. **Resolved.**
- **F8 (MEDIUM) — owner PATCH whitelist:** §8 defines `UpdateTransactionDto` whitelisting only mutable business fields and explicitly excluding `status`, `approvalStatus`, `type`, audit fields, `isRefund`, `userId`, `source`; combined with `whitelist: true` so status transitions only occur via admin-only `/approve`|`/reject`. **Resolved.**
- **F9 (MEDIUM) — admin route guards:** §4 states the guard pair `@UseGuards(JwtAuthGuard, RoleGuardClass)` together with `@Roles('admin')` on every admin-only route, with the explanation that `JwtAuthGuard` does not enforce roles and `RoleGuardClass` reads the `'roles'` metadata. **Resolved.**
- **F10 (MEDIUM) — verification grep too narrow:** §9 expanded to all `admin/**` and `sales/**` pages, covering `getItem`/`setItem`/`removeItem`, listing every business key (including discovered ones), allowing only `token`/`user`/`userRole`/`userFullName`, and documenting `admin_sales_import_results` (admin/uploads) and `users_data` (admin/users) as known intentional exceptions. **Resolved.**
- **N1 (NIT) — rejected_transactions:** §1 and §3.1 restate rejected transactions as a derived view of `confirmed_transactions` (`approvalStatus='rejected'`) exposed via `GET /api/txn/rejected`; dropped from the unified-keys list. **Resolved.**
- **N2 (NIT) — shop_items:** §7.5 drops the dead `shop_items` key and sources the admin dashboard pending-shop count from `txnAPI.all({source:'shop',approvalStatus:'pending'})`. **Resolved.**
- **N3 (NIT) — customerUploadsAPI.save type:** §3.2 and §6 widen `dataType` to `'customers'|'items'|'transactions'` and accept the matching array field. **Resolved.**
- **N4 (NIT) — api.ts base comment:** §1 and §6 correct the note: the literal code fallback is `http://localhost:3001`; the runtime base resolves to `http://localhost:3002` via `NEXT_PUBLIC_API_URL`. **Resolved.**
- **N5 (NIT) — mongodb-memory-server:** §9 lists `mongodb-memory-server` as a devDependency to add (`npm i -D mongodb-memory-server`) before integration tests run. **Resolved.**
- **N6 (NIT) — schema disposition:** §3 states explicitly which schema files are rewritten (`transaction`, `item`), added (`upload`, `chat-message`, `expense`), and left untouched as dead code (`customer`, `payment`, `refund`). **Resolved.**
