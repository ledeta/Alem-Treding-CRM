# Design Review — localStorage → MongoDB Migration (Revision 2)

**Reviewer:** Design-review subagent  
**Prior verdict:** CHANGES_REQUESTED (10 HIGH/MEDIUM findings)  
**Design file:** `.agents/tasks/mongo-migration/design.md` (Revision 2)  
**Verdict:** CHANGES_REQUESTED

---

## Prior Findings Disposition

All 10 HIGH/MEDIUM and 6 NIT findings from Revision 1 are addressed in §12 of the design. Resolution was verified by reading actual source files. See the **Verified Assumptions** section for confirmation of each. Two of those prior-revision fixes introduced new problems — these are listed as NEW findings below.

---

## Findings

### F1 — HIGH | `sales/requests/page.tsx` scope is wrong (§7.3)

**Problem:** The design states §7.3 should replace the page's data load with `txnAPI.mine({ approvalStatus: 'pending' })`. Reading `frontend/src/app/sales/requests/page.tsx` shows the page loads **all** transactions (`confirmed_transactions`, all statuses) and shows them to the sales user sorted by date — not just pending ones. The comment in source is explicit: `// Show ALL transactions (not just pending)`. Replacing the load with a pending-only query silently hides approved and rejected transactions from the sales user's request history, breaking a visible feature.

The page also has a **delete** action that writes back `localStorage.setItem('confirmed_transactions', ...)` which the design omits entirely.

**Fix:**  
Replace §7.3 with:
- Load via `txnAPI.mine()` (no status filter) — returns all the caller's transactions.  
- Delete action → `txnAPI.remove(id)` (owner can remove their own pending requests). For already-approved/rejected transactions disable the delete button (or call `txnAPI.remove` and handle the 403 gracefully).  
- Replace the `window.addEventListener('transactionApproved', ...)` listener with a re-fetch after each mutation.

---

### F2 — HIGH | `admin/page.tsx` `status === 'Paid'` logic will silently zero a dashboard section (§7.5)

**Problem:** `frontend/src/app/admin/page.tsx` lines 492–497 filter approved transactions into two buckets:
```ts
t.approvalStatus === 'approved' && (t.status === 'Paid' || t.paymentStatus === 'completed')  // "paid" bucket
t.approvalStatus === 'approved' && t.status !== 'Paid' && t.paymentStatus !== 'completed'    // "not paid" bucket
```
The design's `Transaction` schema constrains `status` to `['Approved','Pending','Rejected']` and defines no `paymentStatus` field. Neither `status === 'Paid'` nor `paymentStatus === 'completed'` will ever be true, so the "paid" bucket will always be empty and the "not paid" bucket will contain every approved transaction. The dashboard section that shows this split will silently stop working.

The design's §7.5 says "keep existing logic, only swap the source" and "the existing logic that filters `t.approvalStatus === 'approved'` works unchanged" — which is true for the revenue/orders counts but false for this Paid/NotPaid split.

**Fix:**  
Add a note to §7.5 for the Paid/NotPaid filter block (~lines 491–498):  
Either (a) add a `paymentStatus: 'paid' | 'unpaid'` field to the `Transaction` schema (§3.1) so this filter remains meaningful, or (b) explicitly state this block is dead legacy code and must be removed, so the "not paid" / "paid" dashboard card is replaced with a simpler "approved" count. Pick one and document it. The current design text leaves the implementer to discover the silent zero at runtime.

---

### F3 — MEDIUM | `sales/payment-requests/page.tsx` load scope is too narrow (§7.11)

**Problem:** `frontend/src/app/sales/payment-requests/page.tsx` loads `payment_requests` and shows them filtered by **all** statuses (`all`, `pending`, `approved`, `rejected`) — the page has filter buttons for every status. The design maps this to `txnAPI.mine({ approvalStatus: 'pending' })`, which would only return pending requests and make the `approved`/`rejected` filter buttons always show empty lists — a visible regression for the sales user.

**Fix:**  
Change §7.11 to `txnAPI.mine({ source: 'warehouse' })` (no status filter, warehouse source), load all, then client-side filter by `req.approvalStatus` matching the existing UI filter logic. The page's local `filter` state drives the visible list; the API provides the full dataset.

---

### F4 — MEDIUM | `sales/requests/page.tsx` delete action not addressed — owner DELETE authorization gap (§7.3, §4.1)

**Problem:** As noted above, `sales/requests/page.tsx` has a delete action that writes to `localStorage`. When migrated, this maps to `DELETE /api/txn/:id`. The endpoint table in §4.1 marks DELETE as **admin-only** (`@UseGuards(JwtAuthGuard, RoleGuardClass)` + `@Roles('admin')`). Yet the design's §7.3 instructs using `txnAPI.remove(id)` from a sales page, which will always return 403 for a sales user.

**Fix:**  
Decide and document: either (a) change the sales page to call `txnAPI.update(id, { status: ... })` to cancel (keeping delete admin-only and explaining this in §7.3), or (b) change the DELETE endpoint to allow owner deletion of **pending** transactions only (add a service-layer check: `if (doc.approvalStatus !== 'pending') throw 403; if (doc.userId !== userId && !isAdmin) throw 403;`), and update the §4.1 table to reflect that DELETE is accessible to the owner for pending docs. The current design has a direct contradiction between §4.1 and §7.3.

---

### F5 — MEDIUM | `app.module.ts` F3 wiring fix is specified but existing module-level `TypeOrmModule.forFeature` calls will still fail without a TypeORM connection (§5)

**Problem:** The design correctly instructs adding `TypeOrmModule.forRoot(getPostgresConfig())` unconditionally. However, the current `app.module.ts` registers `AuthModule`, `UsersModule`, `CustomersModule`, `ItemsModule`, `UploadsModule`, `PaymentsModule`, `CreditsModule`, `RefundsModule`, `ChatModule`, `NotificationsModule`, `DashboardModule`, `TransactionsModule`, `ApprovalsModule`, `AuditModule`, etc. — **all** of which have their own `TypeOrmModule.forFeature([...])` inside their module files. These module-level `forFeature` calls depend on the **default** TypeORM connection (unnamed).

If the new code registers `TypeOrmModule.forRoot(getPostgresConfig())` with the default connection (no name), those module-level `forFeature` calls will resolve correctly. The design is compatible with this — but it must be explicit: `TypeOrmModule.forRoot(getPostgresConfig())` must be registered as the **default (unnamed)** connection (not named). The design's sketch code does not name the connection (`TypeOrmModule.forRoot(getPostgresConfig())`), which is correct. However, §5 also says `TypeOrmModule.forFeature([User, Role])` in `app.module.ts` becomes unconditional. This is the duplicate of the same `forFeature` already declared inside `auth.module.ts` and `users.module.ts`, which could cause "entity registered twice" warnings or errors depending on the TypeORM version.

**Fix:**  
In §5, clarify: `TypeOrmModule.forFeature([User, Role])` should only be added in `app.module.ts` if `User`/`Role` are **not already registered** in `auth.module.ts`/`users.module.ts`. Verify by checking those module files. If they already register these entities (they do — confirmed in source), remove the duplicate `forFeature([User, Role])` from the `app.module.ts` instruction and instead explain that the unconditional `TypeOrmModule.forRoot(getPostgresConfig())` is sufficient for all existing module-level `forFeature` calls to resolve.

---

### F6 — MEDIUM | `ValidationPipe` uses `forbidNonWhitelisted: false` — design text overstates the 400 error guarantee (§8)

**Problem:** `backend/src/main.ts` registers:
```ts
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true })
```
The design says (§8): "Validated by the global `ValidationPipe` with `whitelist: true` so unknown properties are stripped." This is correct — unknown properties ARE stripped silently. However, the design also says in the F8 resolution: "`whitelist: true`, an owner attempting `PATCH { status: 'Approved' }` has that field stripped" — this is correct and the security invariant holds. But the design implies a 400 is returned on bad fields in several places. Because `forbidNonWhitelisted: false`, sending an unknown property returns HTTP 200 with the property stripped, not HTTP 400. The error handling table (§8) must not claim clients receive 400 for extra unknown fields — they receive 200 with the extra field silently dropped. This is a documentation accuracy problem; the security invariant itself is not broken.

**Fix:**  
Correct §8 to state: "With `whitelist: true` and `forbidNonWhitelisted: false`, extra properties are silently stripped (HTTP 200 returned with the extra field absent). No 400 is returned for unknown extra fields. 400 is only returned when a **required** field is missing or a **present** field fails its type/enum constraint." Remove any language that implies unknown extra properties cause a 400 error.

---

### N1 — NIT | `sales/requests/page.tsx` delete action writes back to localStorage with the full array (§7.3)

**Problem:** `deleteTransaction` in `sales/requests/page.tsx` filters the local state and then writes `localStorage.setItem('confirmed_transactions', JSON.stringify(updated))`. This write-back is an in-memory optimization, but if the design only addresses the load path, the delete write will remain and reintroduce a business-data localStorage key.

**Fix:**  
Explicitly include in §7.3: "Remove the `localStorage.setItem('confirmed_transactions', ...)` write in `deleteTransaction`; the delete is replaced by `txnAPI.remove(id)` and the local state is updated from the API response."

---

### N2 — NIT | §7.3 `sales/requests/page.tsx` load query ambiguity — two different query expressions listed

**Problem:** §7.3 states the load is replaced with `txnAPI.mine({ approvalStatus: 'pending' })` and then separately says `txnAPI.mine({ status: 'pending' })` — two different param objects are given in the same paragraph.

**Fix:**  
The `Transaction` schema has both `status` (capital) and `approvalStatus` (lowercase). The existing page uses `approvalStatus` for filtering. Use `txnAPI.mine({ approvalStatus: 'pending' })` and remove the duplicate `txnAPI.mine({ status: 'pending' })` reference. (Moot given F1 above, but corrects the internal inconsistency for the revised §7.3.)

---

### N3 — NIT | `admin/page.tsx` Paid/NotPaid filter is inside the TypeORM legacy API fallback block (§7.5)

**Problem:** Lines 491–498 of `admin/page.tsx` that use `status === 'Paid'` / `paymentStatus` are inside the TypeORM legacy API fallback block, not the localStorage block. The design's instruction to "remove the API fallback block" (§7.5) would remove this code as a side-effect. The design doesn't acknowledge this, which may confuse the implementer about whether this feature is intentionally deleted or accidentally lost.

**Fix:**  
Add a sentence to §7.5: "The API fallback block (~lines 373–497) is removed entirely. The Paid/NotPaid transaction split (lines 491–498) within that block is a dead feature that referenced a legacy `status: 'Paid'` value never set by the sales pages; it is intentionally not ported to the new API path." (Or, if Paid/NotPaid should be preserved, see F2.)

---

## Verified Assumptions

The following claims from the design were verified by reading actual source:

| Claim | Verified |
|---|---|
| `JwtAuthGuard` only checks JWT + `@Public()`, does not enforce roles | ✓ Confirmed — `auth.guard.ts` only reads `isPublic` metadata |
| `RoleGuardClass` reads `'roles'` metadata and checks `user.role.name` | ✓ Confirmed — `role.guard.ts` lines 14–17, 30 |
| `Roles` decorator uses `SetMetadata('roles', ...)` matching `RoleGuardClass`'s `reflector.get('roles', ...)` | ✓ Confirmed — `roles.decorator.ts` uses `ROLES_KEY = 'roles'` |
| `JwtStrategy.validate` calls `usersService.findById(payload.sub)` with `relations: ['role']` | ✓ Confirmed — `jwt.strategy.ts` + `users.service.ts` findById includes `relations: ['role']` |
| `CurrentUser` decorator returns `request.user` | ✓ Confirmed — `current-user.decorator.ts` |
| `api.ts` base fallback is `http://localhost:3001` | ✓ Confirmed — `api.ts` line 5/8 |
| Global prefix is `/api` via `app.setGlobalPrefix('api')` | ✓ Confirmed — `main.ts` line 20 |
| Global `ValidationPipe` has `whitelist: true` | ✓ Confirmed — `main.ts`; also `forbidNonWhitelisted: false` (see F6) |
| Existing schemas are dead code (no `MongooseModule.forFeature` in any module) | ✓ Confirmed — grep of all modules shows only `TypeOrmModule.forFeature` calls |
| `transaction.schema.ts` already has both `status` (capital enum) and `approvalStatus` (lowercase enum) | ✓ Confirmed — `schemas/transaction.schema.ts` |
| `item.schema.ts` lacks `priceHistory` and needs rewrite | ✓ Confirmed — `schemas/item.schema.ts` has no `priceHistory` field |
| `chat_messages_storage`/`all_chats_storage` used only by `admin/chat-admin`, not `sales/chat` | ✓ Confirmed — grep of all pages |
| `rejected_transactions` localStorage key does not exist | ✓ Confirmed — zero matches in grep |
| `sales/shop/page.tsx` reads `dashboard_items` + `uploaded_sales_items` and writes `shop_payment_requests` / `confirmed_transactions` | ✓ Confirmed |
| `admin/payments/page.tsx` has `uploaded_customers_persist` read/write at ~lines 509-536 | ✓ Confirmed |
| `admin/customers/page.tsx` reads `approved_refunds` and uses `approvalStatus === 'approved'` | ✓ Confirmed |
| `admin/approvals/page.tsx` reads `approvals_data`, seeds from `MOCK_APPROVALS`, maps to `status: 'Pending'` (capital) | ✓ Confirmed |
| `app.module.ts` currently gates `TypeOrmModule.forRoot` and `TypeOrmModule.forFeature([User, Role])` on `!isMongoDb` | ✓ Confirmed — lines 95–103 of `app.module.ts` |
| Controller route prefixes: `transactions`, `uploads`, `items`, `chat`, `customers` | ✓ Confirmed — no collision with new routes `txn`, `customer-uploads`, `inventory`, `messaging`, `expenses` |
| `expenses` localStorage key used by both `admin/payments` and `admin/page` | ✓ Confirmed |
| `approvals_data` and `payment_requests` both used by `admin/approvals` | ✓ Confirmed |

---

## Unverified / Wrong Assumptions

| Claim | Status |
|---|---|
| `sales/requests/page.tsx` loads only pending transactions | **WRONG** — page loads ALL transactions; see F1 |
| `sales/payment-requests/page.tsx` only shows pending requests | **WRONG** — page shows all statuses with filter buttons; see F3 |
| `txnAPI.remove(id)` callable from sales user (DELETE admin-only) | **WRONG / CONTRADICTORY** — §4.1 marks DELETE admin-only but §7.3 uses it for sales; see F4 |
| `admin/page.tsx` Paid/NotPaid split keeps working after migration | **WRONG** — the split uses `status === 'Paid'` which the new schema never sets; see F2 |
| `TypeOrmModule.forFeature([User, Role])` unconditional in `app.module.ts` is needed | **WRONG / DUPLICATE** — `auth.module.ts` and `users.module.ts` already register these entities; adding a duplicate in `app.module.ts` causes warnings; see F5 |

---

## Verdict

2 HIGH findings, 4 MEDIUM findings → **CHANGES_REQUESTED**
