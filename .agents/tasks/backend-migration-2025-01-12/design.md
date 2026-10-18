# Technical Design: Multi-Device Data Synchronization via PostgreSQL Backend Migration

## Overview

This design migrates the Alem Trading CRM from browser localStorage to the PostgreSQL backend database to enable multi-device and multi-browser data synchronization. Currently, all transactional data (customers, items, payments, refunds, expenses) is stored in localStorage, causing data isolation per browser/device. The migration will replace localStorage read/write operations with REST API calls to the existing NestJS backend while maintaining the current UI/UX.

## 1. Backend Inventory: Existing Endpoints and Database Tables

### 1.1 Existing Backend Modules

The backend already has robust modules with CRUD endpoints for most entities:

| Module | Controller | Entity | DB Table | Endpoints |
|--------|-----------|--------|----------|-----------|
| **Transactions** | `transactions.controller.ts` | `SalesTransaction` | `sales_transactions` | POST `/transactions` (create), GET `/transactions` (list with pagination), GET `/transactions/:id`, GET `/transactions/search?q=`, GET `/transactions/by-customer/:customerId`, GET `/transactions/by-item/:itemId`, GET `/transactions/by-type/:type`, GET `/transactions/by-status/:status`, GET `/transactions/history/:customerId`, GET `/transactions/statistics/*`, PUT `/transactions/:id/status`, POST `/transactions/import/sales` (Excel bulk import, public) |
| **Customers** | `customers.controller.ts` | `Customer` | `customers` | POST `/customers` (create), POST `/customers/bulk-create` (public), GET `/customers` (list, public), GET `/customers/:id`, GET `/customers/search?q=&field=`, GET `/customers/inactive?days=15`, GET `/customers/profile/:id`, PUT `/customers/:id`, DELETE `/customers/:id` (soft delete), GET `/customers/stats/active-count` |
| **Items** | `items.controller.ts` | `Item` | `items` | POST `/items` (create), GET `/items` (list, public), GET `/items/:id`, GET `/items/search?q=`, GET `/items/search-by-name?name=`, GET `/items/search-by-sku?sku=`, GET `/items/search-by-category?category=`, GET `/items/stock/low?threshold=`, GET `/items/stock/out-of-stock`, GET `/items/categories`, GET `/items/:id/stock`, PUT `/items/:id`, POST `/items/:id/stock/increase`, POST `/items/:id/stock/decrease`, POST `/items/:id/stock/update`, DELETE `/items/:id` (soft delete) |
| **Payments** | `payments.controller.ts` | `PaymentRequest` | `payment_requests` | POST `/payments` (create, public), GET `/payments` (list), GET `/payments/:id`, GET `/payments/status/:status`, GET `/payments/customer/:customerId`, GET `/payments/bank/:bank`, GET `/payments/search?q=`, GET `/payments/statistics/*`, POST `/payments/:id/approve`, POST `/payments/:id/reject`, PUT `/payments/:id`, DELETE `/payments/:id`, GET `/payments/:customerId/total-approved` |
| **Refunds** | `refunds.controller.ts` | `RefundRequest` | `refund_requests` | POST `/refunds` (create), GET `/refunds` (list), GET `/refunds/:id`, GET `/refunds/status/:status`, GET `/refunds/customer/:customerId`, GET `/refunds/item/:itemId`, GET `/refunds/search?q=`, GET `/refunds/statistics/*`, POST `/refunds/:id/approve`, POST `/refunds/:id/reject`, POST `/refunds/:id/complete`, PUT `/refunds/:id`, DELETE `/refunds/:id` |
| **Credits** | `credits.controller.ts` | `CreditRequest` | `credit_requests` | Standard CRUD endpoints (not reviewed in detail, but present) |
| **Dashboard** | `dashboard.controller.ts` | N/A (aggregator) | N/A | GET `/dashboard` (complete dashboard data), GET `/dashboard/kpis`, GET `/dashboard/sales-trend`, GET `/dashboard/customer-distribution`, GET `/dashboard/top-items`, GET `/dashboard/top-customers`, GET `/dashboard/payment-status`, GET `/dashboard/recent-transactions`, GET `/dashboard/pending-approvals` |

### 1.2 Database Schema

**Existing Tables:**
- `sales_transactions` (entity: `SalesTransaction`)
  - Fields: `id`, `transactionId` (unique), `customer` (FK), `item` (FK), `quantity`, `unitPrice`, `totalAmount`, `transactionType` (enum: Sale/Refund/Credit/Payment), `status` (enum: Pending/Completed/Cancelled), `transactionDate`, `notes`, `createdBy` (FK user), `discountAmount`, `taxAmount`, `referenceId`, `referenceType`, `branch` (enum: Warehouse/Shop), `isImported`, `createdAt`, `updatedAt`

- `customers` (entity: `Customer`)
  - Fields: `id`, `name`, `customerIdRef` (unique), `phone`, `address`, `email`, `city`, `region`, `country` (default: Ethiopia), `isActive`, `source` (Excel Import/Manual Entry), `lastTransactionDate`, `balance` (OneToOne to `customer_balances`), `createdAt`, `updatedAt`

- `items` (entity: `Item`)
  - Fields: `id`, `name`, `sku` (unique), `description`, `category`, `purchasePrice`, `sellingPrice`, `isActive`, `stock` (OneToOne to `stocks`), `createdAt`, `updatedAt`

- `payment_requests` (entity: `PaymentRequest`)
  - Fields: `id`, `customer` (FK), `amount`, `bank` (enum: Telebirr/CBE/Dashen Bank/Awash Bank/Abyssinia Bank/Wegagen Bank/Siinqee Bank/Other), `reason`, `requestDate`, `requestTime`, `status` (enum: Pending/Approved/Rejected), `createdBy` (FK user), `approvedBy` (FK user, nullable), `approvalDate`, `notes`, `createdAt`, `updatedAt`

- `refund_requests` (entity: `RefundRequest`)
  - Fields: `id`, `customer` (FK), `item` (FK), `quantity`, `refundAmount`, `reason`, `description`, `status` (enum: Pending/Approved/Rejected/Completed), `isInventoryUpdated`, `createdBy` (FK user), `approvedBy` (FK user), `approvalDate`, `completionDate`, `notes`, `createdAt`, `updatedAt`

- `credit_requests` (entity: `CreditRequest`) - schema not reviewed in detail

- `customer_balances`, `stocks`, `users`, `roles` (supporting tables)

**Missing Tables:**
- **expenses** table does not exist in the backend. The frontend stores expenses in `localStorage.getItem('expenses')` with schema: `{id, category, description, amount, date, paymentMethod, notes, createdAt}`.

### 1.3 Authentication & Authorization

- **JWT-based authentication**: Backend uses `JwtAuthGuard` (from `@nestjs/passport`) with a custom guard in `src/common/guards/auth.guard.ts`.
- **Public endpoints**: Controllers use `@Public()` decorator to bypass JWT auth. Many read endpoints are public (e.g., `/customers`, `/items`, `/transactions`).
- **Frontend token storage**: JWT token is stored in `localStorage.getItem('token')` and passed in `Authorization: Bearer <token>` header.
- **User context**: Authenticated requests include user ID via `@CurrentUser()` decorator (from JWT payload). The `createdBy` field in entities is populated with the authenticated user ID.
- **Role-based authorization**: Some endpoints use `RoleGuard` (e.g., customers endpoints), but many are open or rely on JWT only.

### 1.4 API Configuration

- **Frontend API client**: Centralized in `frontend/src/lib/api-config.ts`:
  ```typescript
  export const getApiUrl = (): string => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  export const buildApiUrl = (endpoint: string): string => {
    const baseUrl = getApiUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const apiEndpoint = cleanEndpoint.startsWith('/api/') ? cleanEndpoint : `/api${cleanEndpoint}`;
    return `${baseUrl}${apiEndpoint}`;
  };
  ```
  - **Note**: The backend actually runs on port `3002` and does NOT prefix routes with `/api/` in the controllers. The `buildApiUrl` helper adds `/api/` prefix, which may cause 404s. This needs correction or backend routes need the `/api` prefix.

- **Backend base URL**: Configured in `backend/.env`: `API_URL=http://localhost:3002`, `PORT=3002`.
- **Database connection**: PostgreSQL at `localhost:5432`, database `alem_crm`, user/password `postgres/postgres` (local dev). Production uses `DATABASE_URL` env var.

## 2. LocalStorage Data Mapping to Backend Endpoints

The frontend uses the following localStorage keys. Each maps to backend endpoints:

| localStorage Key | Data Shape | Read Endpoint | Write Endpoint | Notes |
|------------------|-----------|---------------|----------------|-------|
| `confirmed_transactions` | `Array<{id, customer, customerName, type: 'Payment'\|'Credit', amount, date, status, approvalStatus: 'pending'\|'approved'\|'rejected', bank, reason, items?, isRefund?}>` | GET `/transactions?page=1&limit=1000` (filter by `transactionType`, status) | POST `/transactions` (for approved transactions) | Frontend stores ALL transactions here (pending, approved, rejected). Backend `sales_transactions` table stores completed/approved transactions. Pending transactions should use `payment_requests` (for payments) or a new `pending_transactions` table. The frontend's `approvalStatus` field is not in the backend schema — may need to map `status` enum. |
| `payment_requests` | `Array<{id, customerName, customer, type: 'Payment', amount, date, status, approvalStatus, bank, reason, items?, isRefund?}>` | GET `/payments?page=1&limit=1000` (filter by `status=Pending`) | POST `/payments` (create payment request) | Backend supports this directly. Refund requests are stored here with `isRefund: true` flag in frontend, but backend has separate `refund_requests` table. Frontend should use POST `/refunds` for refund requests. |
| `shop_payment_requests` | `Array<{id, customerName, type: 'Payment'\|'Credit', amount, date, status, approvalStatus, bank, reason, items?}>` | GET `/payments/status/Pending` (or new endpoint `/payments?source=shop`) | POST `/payments` with `source='shop'` field | Backend `payment_requests` table does not have a `source` field. Options: (a) add `source` field to `payment_requests` entity, or (b) use separate table, or (c) store in `notes` field. Recommend (a): add `source` VARCHAR field. |
| `approved_refunds` | `Array<{id, customerName, amount, reason, transactionId, items?, approvedAt, approvedBy, status: 'Approved'}>` | GET `/refunds?status=Approved` or GET `/refunds?status=Completed` | POST `/refunds/:id/approve` (approval), POST `/refunds/:id/complete` (completion) | Backend `refund_requests` has statuses Pending/Approved/Rejected/Completed. Approved refunds should be fetched via GET `/refunds/status/Approved` or `/refunds/status/Completed`. |
| `expenses` | `Array<{id, category, description, amount, date, paymentMethod, notes, createdAt}>` | **MISSING**: No backend endpoint | **MISSING**: No backend endpoint | Backend does NOT have an expenses module or table. Need to create: `expenses` table, `ExpensesModule`, `ExpensesController`, `ExpensesService`, with CRUD endpoints: POST `/expenses`, GET `/expenses`, GET `/expenses/:id`, PUT `/expenses/:id`, DELETE `/expenses/:id`. Entity schema: `{id, category, description, amount: decimal(15,2), date, paymentMethod, notes, createdBy: FK user, createdAt, updatedAt}`. |
| `dashboard_items` | `Array<{id, name, category, stock, price}>` | GET `/items?page=1&limit=1000` (fetch all active items) | (items are managed via admin customers page, use existing `/items` endpoints) | No special handling needed. Frontend should fetch items from `/items` and store in state, not localStorage. Warehouse value = sum(stock * price) calculated client-side or via dashboard endpoint. |
| `uploaded_customers_persist` | `Array<{name, matched, inDatabase, _rejectedTransaction?, _isRejectedPayment?}>` | N/A (UI-only state for Excel upload workflow) | N/A | This is ephemeral UI state for the sales Excel upload flow. Not stored in DB. Can remain in localStorage or move to React state. No backend changes needed. |
| `users_data` | `Array<{username, password1, password2, role}>` | GET `/users` (admin only) | POST `/users`, PUT `/users/:id` | Users are managed via backend `users` table. Frontend login should authenticate via POST `/auth/login` and store JWT token. Storing passwords in localStorage is insecure. This should be removed and rely solely on JWT token. User management is out of scope for this migration (separate auth system). |
| `token` | `string` (JWT token) | N/A | POST `/auth/login` returns JWT | Already using backend auth. No changes needed. |
| `user` | `{username, role, ...}` | N/A | POST `/auth/login` returns user object | Already using backend auth. No changes needed. |
| `admin_sales_import_results` | `Array<{fileName, uploadedAt, status, totalRows, successCount, failCount, ...}>` | N/A (UI-only state for upload history) | POST `/transactions/import/sales` (backend stores transactions, not upload metadata) | Upload history is UI-only. Can remain in localStorage or move to backend `upload_logs` table if persistent history is desired. Out of scope for MVP. |

## 3. Backend Changes Required

### 3.1 New Module: Expenses

**Create**: `backend/src/modules/expenses` module with the following structure:

**Entity**: `expenses/entities/expense.entity.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('expenses')
@Index(['category'])
@Index(['date'])
@Index(['paymentMethod'])
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string; // e.g., 'Rent', 'Utilities', 'Salaries', 'Supplies', etc.

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  paymentMethod: string; // e.g., 'cash', 'bank_transfer', 'credit'

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**DTOs**: `expenses/dto/create-expense.dto.ts`, `expenses/dto/update-expense.dto.ts`
```typescript
// create-expense.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  notes?: string;

  createdBy?: number; // Injected from JWT context
}

// update-expense.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
```

**Service**: `expenses/expenses.service.ts` with methods:
- `create(createExpenseDto, userId)`: Insert expense with `createdBy = userId`
- `findAll(page, limit, filters?)`: Paginated list with optional filters (category, date range, paymentMethod)
- `findById(id)`: Fetch single expense
- `update(id, updateExpenseDto)`: Update expense
- `delete(id)`: Soft delete or hard delete (recommend hard delete for expenses)
- `getTotalExpensesByPaymentMethod()`: Aggregate by `paymentMethod` (for dashboard stats: paid vs unpaid)
- `getTotalExpensesAmount(startDate?, endDate?)`: Sum of all expenses (with optional date range filter)

**Controller**: `expenses/expenses.controller.ts` with routes:
- POST `/expenses` (create, requires JWT auth)
- GET `/expenses` (list with pagination, optional filters: ?page=1&limit=10&category=&paymentMethod=&startDate=&endDate=)
- GET `/expenses/:id` (get by ID)
- GET `/expenses/statistics/total` (get total expenses amount)
- GET `/expenses/statistics/by-payment-method` (aggregate by payment method)
- PUT `/expenses/:id` (update)
- DELETE `/expenses/:id` (delete)

**Guards**: Use `JwtAuthGuard` for all endpoints (no public endpoints for expenses).

**Module**: `expenses/expenses.module.ts` imports `TypeOrmModule.forFeature([Expense])` and exports `ExpensesService`.

**App Module**: Import `ExpensesModule` in `app.module.ts`.

### 3.2 Extend Existing Endpoints

#### 3.2.1 Payment Requests: Add `source` Field

**Modify**: `backend/src/modules/payments/entities/payment-request.entity.ts`
```typescript
@Column({ nullable: true })
source: string; // 'warehouse' | 'shop'
```

**Modify**: `backend/src/modules/payments/dto/create-payment.dto.ts`
```typescript
@IsString()
@IsOptional()
source?: string;
```

**Update**: `PaymentsService.create()` to store `source` field.

**Add endpoint**: GET `/payments?source=shop` to filter by source (update `PaymentsController.findAll()` to accept `source` query param).

#### 3.2.2 Transactions: Separate Pending Transactions

**Current Issue**: Frontend stores pending transactions in `confirmed_transactions` localStorage key, but backend `sales_transactions` table is for completed transactions. Pending payments use `payment_requests`, but pending credits and multi-bank payments are not well-supported.

**Options**:
1. **Use `payment_requests` for all pending transactions** and filter by `status='Pending'`. When approved, create `sales_transactions` record and update `payment_requests.status='Approved'`.
2. **Use `sales_transactions.status` field**: Store pending transactions in `sales_transactions` with `status='Pending'`, then update to `status='Completed'` on approval.

**Recommendation**: Option 1 — keep `payment_requests` for pending payments/credits/refunds, and only insert into `sales_transactions` when approved. This separates approval workflow from transaction history.

**Implementation**:
- Frontend submits payment/credit requests via POST `/payments` (for warehouse requests) or POST `/payments?source=shop` (for shop requests).
- Backend creates `payment_requests` record with `status='Pending'`.
- Admin approves via POST `/payments/:id/approve`:
  - Update `payment_requests.status='Approved'`, `payment_requests.approvedBy`, `payment_requests.approvalDate`.
  - Create `sales_transactions` record with `transactionType='Payment'` or `'Credit'`, `status='Completed'`, `referenceId=paymentRequest.id`, `referenceType='payment_request'`.
  - If payment includes items (deducting stock), call `ItemsService.decreaseStock()` for each item.
- Frontend fetches approved transactions via GET `/transactions?status=Completed&page=1&limit=1000`.
- Frontend fetches pending requests via GET `/payments/status/Pending?page=1&limit=1000`.

#### 3.2.3 Refunds: Align Frontend and Backend

**Current Issue**: Frontend stores refund requests in `payment_requests` localStorage with `isRefund: true` flag, then moves to `approved_refunds` on approval. Backend has separate `refund_requests` table.

**Solution**: Frontend should use POST `/refunds` (not POST `/payments`) to create refund requests. Backend already has approval endpoints: POST `/refunds/:id/approve`, POST `/refunds/:id/complete`.

**Workflow**:
1. Sales user submits refund via POST `/refunds` with `{customer, item, quantity, refundAmount, reason, items[]}`.
2. Backend creates `refund_requests` record with `status='Pending'`.
3. Admin approves via POST `/refunds/:id/approve`:
   - Update `refund_requests.status='Approved'`, `refund_requests.approvedBy`, `refund_requests.approvalDate`.
   - Create `sales_transactions` record with `transactionType='Refund'`, `status='Completed'`.
   - If `isInventoryUpdated=false`, call `ItemsService.increaseStock()` for each item (refund returns stock).
   - Update `refund_requests.isInventoryUpdated=true`.
4. Admin completes via POST `/refunds/:id/complete`:
   - Update `refund_requests.status='Completed'`, `refund_requests.completionDate`.
   - Create credit transaction (POST `/transactions` with `transactionType='Credit'`) to adjust customer balance.
5. Frontend fetches approved refunds via GET `/refunds/status/Approved` or GET `/refunds/status/Completed`.

**Backend changes**: None required, endpoints already exist. Frontend must use correct endpoints.

#### 3.2.4 Dashboard Endpoint Enhancements

The dashboard aggregates data from multiple tables. Current `/dashboard` endpoint may not return all required stats. Ensure it returns:
- Total customers (`/customers/stats/active-count`)
- Total revenue (sum of approved payments)
- Total credits (sum of approved credits)
- Total refunds (sum of approved refunds)
- Total expenses (sum from new `expenses` table)
- Warehouse value (sum of `items.stock * items.sellingPrice`)
- Pending requests count (pending `payment_requests` + pending `refund_requests`)
- No-visit customers (customers with `lastTransactionDate < now() - 15 days`)

**Options**:
1. Enhance existing `/dashboard` endpoint to return all stats in one call.
2. Keep separate endpoint calls (frontend already does this).

**Recommendation**: Option 2 — keep separate endpoint calls for flexibility and caching. Frontend can call:
- GET `/customers/stats/active-count`
- GET `/transactions/statistics/total-sales`
- GET `/transactions/statistics/total-refunds`
- GET `/expenses/statistics/total`
- GET `/items?page=1&limit=1000` (calculate warehouse value client-side)
- GET `/customers/inactive?days=15` (returns count)
- GET `/payments/statistics/pending-count`
- GET `/refunds/statistics/pending-count`

No backend changes needed if these endpoints already exist (most do). Add `/expenses/statistics/total` in new expenses module.

### 3.3 Authorization & Public Endpoints Review

**Current state**: Many endpoints are marked `@Public()` (e.g., `/customers`, `/items`, `/transactions`). This is likely for development convenience but is insecure for production.

**Recommendation**: Audit public endpoints and restrict to authenticated users. For MVP migration, keep endpoints public if frontend does not consistently send JWT token, but add to post-migration cleanup tasks.

**Endpoints to secure (post-MVP)**:
- POST `/customers/bulk-create` → require JWT
- GET `/customers` → require JWT (or keep public if needed for anonymous browsing)
- GET `/items` → require JWT
- GET `/transactions` → require JWT

### 3.4 Error Handling & Validation

**All endpoints must return**:
- **Success**: HTTP 200/201 with JSON payload `{success: true, data: {...}, message?: string}`
- **Client error (400)**: `{success: false, error: string, message: string}` (e.g., validation errors)
- **Auth error (401)**: `{success: false, error: 'Unauthorized', message: 'Invalid or missing token'}`
- **Not found (404)**: `{success: false, error: 'Not Found', message: 'Resource with id X not found'}`
- **Server error (500)**: `{success: false, error: 'Internal Server Error', message: string}`

**Validation**: Use NestJS class-validator decorators in DTOs. Return 400 with field-level errors.

**Logging**: Log all create/update/delete operations to audit log (use existing `AuditModule` if available). Log level: INFO for success, ERROR for failures. Include user ID, timestamp, operation, entity type, entity ID.

## 4. Frontend Changes Required

### 4.1 API Client Utility

**Create**: `frontend/src/lib/api-client.ts` — centralized API client with:
- **Base URL**: Use `buildApiUrl()` from `api-config.ts`, but fix the `/api/` prefix issue (backend routes do NOT have `/api/` prefix unless configured in NestJS global prefix).
- **Auth headers**: Automatically include `Authorization: Bearer <token>` from `localStorage.getItem('token')` for all requests.
- **Error handling**: Catch and format errors (network errors, 401 → redirect to login, 400 → show validation errors, 500 → show generic error).
- **Loading states**: Return `{loading: boolean, data: T | null, error: string | null}` for each request.
- **Retry logic**: Optional — retry on network failure (not for MVP).

**Example**:
```typescript
// frontend/src/lib/api-client.ts
import { buildApiUrl } from './api-config';

export interface ApiResponse<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiGet = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  const url = new URL(buildApiUrl(endpoint));
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

export const apiPost = async <T>(endpoint: string, body: any): Promise<T> => {
  const response = await fetch(buildApiUrl(endpoint), {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

export const apiPut = async <T>(endpoint: string, body: any): Promise<T> => {
  const response = await fetch(buildApiUrl(endpoint), {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

export const apiDelete = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(buildApiUrl(endpoint), {
    method: 'DELETE',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};
```

**Fix `/api/` prefix issue**: Either:
1. Remove `/api/` prefix addition in `buildApiUrl()` (backend routes don't have it), OR
2. Add global prefix to backend in `main.ts`: `app.setGlobalPrefix('api')`.

**Recommendation**: Option 2 — add `app.setGlobalPrefix('api')` in `backend/src/main.ts` for RESTful convention. Then `buildApiUrl('/customers')` → `http://localhost:3002/api/customers`.

### 4.2 Page-by-Page Migration

#### 4.2.1 Admin Dashboard (`frontend/src/app/admin/page.tsx`)

**Current localStorage reads**:
- `localStorage.getItem('confirmed_transactions')` → calculate total customers, revenue, credits
- `localStorage.getItem('dashboard_items')` → calculate warehouse value
- `localStorage.getItem('expenses')` → calculate total expenses, paid expenses
- `localStorage.getItem('payment_requests')` + `localStorage.getItem('shop_items')` → count pending requests
- `localStorage.getItem('approved_refunds')` → total refunds

**Replace with API calls**:
```typescript
// In loadDashboardData() function:
const [stats, setStats] = useState({ totalCustomers: 0, totalRevenue: 0, ... });
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const loadDashboardData = async () => {
  setLoading(true);
  setError(null);
  try {
    // Parallel API calls
    const [customers, transactions, items, expenses, pendingPayments, pendingRefunds, inactiveCustomers] = await Promise.all([
      apiGet('/customers/stats/active-count'),
      apiGet('/transactions/statistics/total-sales'),
      apiGet('/items', { page: 1, limit: 1000 }),
      apiGet('/expenses/statistics/total'),
      apiGet('/payments/statistics/pending-count'),
      apiGet('/refunds/statistics/pending-count'),
      apiGet('/customers/inactive', { days: 15 }),
    ]);

    // Calculate warehouse value client-side
    const warehouseValue = items.data.reduce((sum, item) => sum + (item.stock.quantity * item.sellingPrice), 0);

    setStats({
      totalCustomers: customers.count,
      totalRevenue: transactions.total,
      warehouseValue,
      totalExpenses: expenses.total,
      pendingOrders: pendingPayments.count + pendingRefunds.count,
      noVisitCustomers: inactiveCustomers.length,
      // ... other stats
    });
  } catch (err: any) {
    setError(err.message || 'Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};
```

**Loading states**: Show loading spinner while `loading === true`.

**Error handling**: Display error message if `error !== null`. Provide "Retry" button.

**Remove localStorage writes**: Delete all `localStorage.setItem('confirmed_transactions', ...)` calls. Data is now read-only from API.

#### 4.2.2 Admin Customers Page (`frontend/src/app/admin/customers/page.tsx`)

**Current localStorage reads**:
- `localStorage.getItem('confirmed_transactions')` → calculate customer balances, transactions
- `localStorage.getItem('dashboard_items')` → item list for transactions

**Replace with API calls**:
```typescript
// Load customers
const [customers, setCustomers] = useState([]);
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const [customersData, itemsData] = await Promise.all([
        apiGet('/customers', { page: 1, limit: 1000 }),
        apiGet('/items', { page: 1, limit: 1000 }),
      ]);
      setCustomers(customersData.data);
      setItems(itemsData.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);

// Load customer transactions (on customer select)
const loadCustomerTransactions = async (customerId: number) => {
  try {
    const txData = await apiGet(`/transactions/by-customer/${customerId}`, { page: 1, limit: 1000 });
    setSelectedCustomerTransactions(txData.data);
  } catch (err) {
    console.error('Failed to load transactions:', err);
  }
};
```

**Remove localStorage writes**: Delete all `localStorage.setItem('confirmed_transactions', ...)` and `localStorage.setItem('dashboard_items', ...)` calls.

**Polling**: If real-time updates are needed, poll every 30 seconds via `setInterval()` or use WebSockets (out of scope for MVP).

#### 4.2.3 Admin Payments Page (`frontend/src/app/admin/payments/page.tsx`)

**Current localStorage reads**:
- `localStorage.getItem('payment_requests')` → pending warehouse requests
- `localStorage.getItem('shop_payment_requests')` → pending shop requests
- `localStorage.getItem('approved_refunds')` → refund list
- `localStorage.getItem('expenses')` → expense list

**Replace with API calls**:
```typescript
// Load pending requests
const [warehouseRequests, setWarehouseRequests] = useState([]);
const [shopRequests, setShopRequests] = useState([]);
const [refunds, setRefunds] = useState([]);
const [expenses, setExpenses] = useState([]);

useEffect(() => {
  const loadData = async () => {
    try {
      const [whRequests, shRequests, refundsData, expensesData] = await Promise.all([
        apiGet('/payments/status/Pending', { page: 1, limit: 1000 }), // warehouse requests
        apiGet('/payments/status/Pending', { source: 'shop', page: 1, limit: 1000 }), // shop requests
        apiGet('/refunds/status/Approved', { page: 1, limit: 1000 }),
        apiGet('/expenses', { page: 1, limit: 1000 }),
      ]);
      setWarehouseRequests(whRequests.data);
      setShopRequests(shRequests.data);
      setRefunds(refundsData.data);
      setExpenses(expensesData.data);
    } catch (err) {
      console.error('Failed to load payments data:', err);
    }
  };
  loadData();
}, []);

// Approve payment request
const handleApprove = async (transactionId: number) => {
  try {
    await apiPost(`/payments/${transactionId}/approve`, { notes: '' });
    alert('Request approved!');
    // Reload data
    loadData();
  } catch (err: any) {
    alert(`Approval failed: ${err.message}`);
  }
};

// Add expense
const handleAddExpense = async (expenseData) => {
  try {
    await apiPost('/expenses', expenseData);
    alert('Expense added!');
    loadData();
  } catch (err: any) {
    alert(`Failed to add expense: ${err.message}`);
  }
};
```

**Remove localStorage writes**: Delete all `localStorage.setItem('expenses', ...)`, `localStorage.setItem('payment_requests', ...)`, etc.

#### 4.2.4 Sales Customers Balance Page (`frontend/src/app/sales/customers-balance/page.tsx`)

**Current localStorage reads**:
- `localStorage.getItem('confirmed_transactions')` → customer balances

**Replace with API calls**:
```typescript
// Load customers with balances
const [customers, setCustomers] = useState([]);

useEffect(() => {
  const loadCustomers = async () => {
    try {
      const customersData = await apiGet('/customers', { page: 1, limit: 1000 });
      // Backend should return `balance` field (from customer_balances table)
      // Or calculate client-side by fetching transactions per customer
      setCustomers(customersData.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };
  loadCustomers();
}, []);

// Submit payment request
const handlePaymentRequest = async (paymentData) => {
  try {
    await apiPost('/payments', { ...paymentData, source: 'shop' });
    alert('Payment submitted for approval!');
  } catch (err: any) {
    alert(`Failed to submit payment: ${err.message}`);
  }
};

// Submit refund request
const handleRefundRequest = async (refundData) => {
  try {
    await apiPost('/refunds', refundData);
    alert('Refund submitted for approval!');
  } catch (err: any) {
    alert(`Failed to submit refund: ${err.message}`);
  }
};
```

**Remove localStorage writes**: Delete all `localStorage.setItem('confirmed_transactions', ...)`, `localStorage.setItem('shop_payment_requests', ...)`.

### 4.3 Offline/Failure Handling Strategy

**Goal**: Graceful degradation when backend is unavailable.

**Strategy**:
1. **Loading states**: Show spinner or skeleton UI while API calls are in progress. Never show stale localStorage data.
2. **Error states**: Display user-friendly error message with "Retry" button if API call fails.
3. **Network detection**: Use `navigator.onLine` to detect offline state and show banner: "You are offline. Some features may not work."
4. **Retry logic**: On network error (not 400/500), automatically retry after 3 seconds (max 3 retries). Exponential backoff optional.
5. **Optimistic UI (optional for MVP)**: For create/update operations, update UI immediately and rollback if API call fails.
6. **No localStorage fallback**: Do NOT fall back to localStorage if API fails. This would re-introduce multi-device sync issues.

**Implementation**:
```typescript
// In api-client.ts
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const fetchWithRetry = async (url: string, options: RequestInit, retries = 0): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (error: any) {
    if (retries < MAX_RETRIES && error.message.includes('Failed to fetch')) {
      console.warn(`Network error, retrying (${retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
};

// Use fetchWithRetry in apiGet, apiPost, etc.
```

**UI components**: Add `<ErrorBoundary>` component to catch and display errors. Add `<LoadingSpinner>` component for loading states.

### 4.4 Data Migration Script (Optional)

**Goal**: Migrate existing localStorage data to the backend database.

**Scope**: For existing users who have data in localStorage, provide a one-time migration script that:
1. Reads all localStorage keys (`confirmed_transactions`, `expenses`, `dashboard_items`, etc.).
2. Sends bulk POST requests to backend to create records.
3. Clears localStorage after successful migration.
4. Shows migration progress UI.

**Implementation**:
- Create `frontend/src/lib/migrate-local-data.ts` with function `migrateLocalStorageToBackend()`.
- Call on first app load after migration (detect via `localStorage.getItem('migrated') === null`).
- Show modal: "Migrating your data to the server... This may take a few moments."
- On success, set `localStorage.setItem('migrated', 'true')` and clear data keys.
- On failure, show error and allow retry.

**Decision**: Optional for MVP. If existing production users have critical data in localStorage, implement migration. If this is a new deployment or test environment, skip migration.

## 5. Testing Plan

### 5.1 Backend Testing

**Unit tests** (using Jest + NestJS testing utilities):
- `ExpensesService`: Test create, findAll, update, delete, getTotalExpensesAmount.
- `PaymentsService`: Test create with `source` field, approve workflow.
- `RefundsService`: Test approve workflow, inventory update.
- `ItemsService`: Test stock increase/decrease.

**Integration tests**:
- Test full payment approval flow: POST `/payments` → POST `/payments/:id/approve` → verify `sales_transactions` created.
- Test full refund approval flow: POST `/refunds` → POST `/refunds/:id/approve` → verify inventory updated and credit transaction created.
- Test dashboard endpoints return correct aggregated stats.

**API tests** (using Postman or automated with `supertest`):
- Test all CRUD endpoints for expenses module.
- Test authentication: endpoints return 401 without token, 200 with valid token.
- Test pagination: endpoints return correct page and total count.

### 5.2 Frontend Testing

**Manual testing**:
- Admin dashboard loads stats from backend correctly.
- Admin customers page displays customer list and transactions.
- Admin payments page loads pending requests and allows approve/reject.
- Admin payments page allows adding expenses and displays list.
- Sales customers balance page allows submitting payment/refund requests.
- Test multi-device: Open app on two browsers, approve a request in one, verify it updates in the other (after reload or polling).
- Test offline: Disconnect network, verify error states are shown. Reconnect, verify retry works.

**Automated E2E tests** (using Playwright or Cypress, optional for MVP):
- Test login flow and token storage.
- Test payment request submission and approval flow.
- Test expense creation.

### 5.3 Data Synchronization Testing

**Goal**: Verify data syncs across devices/browsers.

**Test cases**:
1. User A submits payment request on Browser 1 → verify it appears in admin pending list on Browser 2.
2. Admin approves payment on Browser 1 → verify it appears in customer balance on Browser 2 (after reload).
3. User B adds expense on Browser 1 → verify it appears in expenses list on Browser 2.

**Polling**: If no real-time sync (WebSockets), test that polling interval (30 sec) works correctly.

### 5.4 Performance Testing

**Goal**: Ensure API calls are fast and pagination works.

**Test cases**:
- Load dashboard with 1000+ transactions → verify it loads in <2 seconds.
- Load customers page with 500+ customers → verify pagination works and page loads in <1 second.
- Test concurrent approvals (10 admins approve 10 requests simultaneously) → verify no race conditions or duplicate transactions.

## 6. Rollout Plan

### 6.1 Phase 1: Backend Setup (Week 1)
1. Add global `/api` prefix to backend (`app.setGlobalPrefix('api')` in `main.ts`).
2. Create `ExpensesModule` with full CRUD.
3. Add `source` field to `payment_requests` entity and update endpoints.
4. Test all backend endpoints via Postman.
5. Run backend unit and integration tests.

### 6.2 Phase 2: Frontend API Integration (Week 2)
1. Create `api-client.ts` with auth and error handling.
2. Migrate admin dashboard page to use API calls (no localStorage reads).
3. Migrate admin customers page to use API calls.
4. Migrate admin payments page to use API calls (including expenses).
5. Migrate sales customers balance page to use API calls.
6. Add loading states and error handling to all pages.

### 6.3 Phase 3: Data Migration (if needed, Week 3)
1. Implement `migrateLocalStorageToBackend()` script.
2. Test migration with sample localStorage data.
3. Deploy migration UI to production.

### 6.4 Phase 4: Testing & QA (Week 3)
1. Manual testing of all pages on multiple browsers.
2. Test multi-device synchronization.
3. Test offline/error scenarios.
4. Load testing with 1000+ records.

### 6.5 Phase 5: Production Deployment (Week 4)
1. Deploy backend changes to production.
2. Deploy frontend changes to production.
3. Monitor logs for errors (use backend audit logs).
4. Provide user training on new behavior (data syncs across devices).

### 6.6 Phase 6: Cleanup (Post-MVP)
1. Remove all localStorage read/write code from frontend (except `token`, `user`).
2. Secure public endpoints (add JWT auth).
3. Implement WebSockets for real-time updates (replace polling).
4. Add backend caching (Redis) for dashboard stats.

## 7. Open Questions and Assumptions

### 7.1 Open Questions

1. **API Prefix**: Should backend routes have `/api` prefix? Current frontend assumes yes (`buildApiUrl` adds it), but backend controllers don't have it.
   - **Answer needed**: Confirm backend global prefix configuration.

2. **Public Endpoints**: Many backend endpoints are marked `@Public()`. Is this intentional for production?
   - **Answer needed**: Confirm which endpoints should be public vs authenticated.

3. **Customer Balances**: Should backend calculate customer balances or frontend calculate from transactions?
   - **Answer needed**: Backend has `customer_balances` table but it may not be automatically updated. Confirm if backend should handle balance updates on transaction approval.

4. **Data Migration**: Do existing production users have critical data in localStorage that must be migrated?
   - **Answer needed**: If yes, implement migration script. If no, skip migration.

5. **Real-Time Sync**: Is polling every 30 seconds acceptable, or should we implement WebSockets for real-time updates?
   - **Answer needed**: Polling is simpler for MVP. WebSockets can be added later.

6. **Expenses Categories**: Should expense categories be predefined (enum) or free text?
   - **Assumption**: Free text for flexibility. Backend stores as VARCHAR.

7. **Multi-Bank Payments**: Frontend supports multi-bank payments (one payment split across multiple banks). How should backend store this?
   - **Assumption**: Create separate `payment_requests` records for each bank (with `bankNumber` and `totalBanks` fields in notes). Backend does not have special multi-bank schema.

8. **Transaction IDs**: Frontend stores `transactionId` (reference number) in `reason` field for payments. Should backend have dedicated `transactionIdRef` field?
   - **Assumption**: Store in `reason` field for now. Can add dedicated field later.

### 7.2 Assumptions

1. **Backend is running and accessible** at `http://localhost:3002` (dev) and production URL (to be configured).
2. **PostgreSQL database is running** and backend can connect successfully.
3. **JWT authentication is working** and frontend stores valid token in localStorage.
4. **User roles** (admin, sales) are managed by backend and frontend respects them (out of scope for this migration).
5. **No real-time sync** for MVP — frontend will poll or require manual refresh to see updates from other devices.
6. **No offline mode** for MVP — app requires internet connection to function.
7. **No data migration script** unless explicitly requested (assumes fresh deployment or test environment).
8. **Existing backend endpoints are stable** and return data in expected format (no breaking API changes during migration).
9. **No UI changes** except for loading spinners and error messages (maintain existing UI/UX).
10. **Backend automatically updates `customer_balances` table** when transactions are approved (or frontend calculates balances from transactions).

### 7.3 Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Backend API returns unexpected data format | High | Medium | Add runtime validation in frontend (TypeScript types + Zod schema validation). Add integration tests. |
| API calls are slow (>2 sec) | High | Low | Add pagination with small page sizes. Cache frequently accessed data (items, customers) in frontend state. Add backend indexes on queried fields. |
| Data loss during migration | High | Low | Implement atomic migration with transaction rollback. Test migration script thoroughly. Backup localStorage data before clearing. |
| Auth token expires during session | Medium | Medium | Implement token refresh logic (POST `/auth/refresh` with refresh token). Automatically refresh token before expiry. |
| Race condition on concurrent approvals | Medium | Low | Use database transactions and optimistic locking in backend. Test concurrent approval scenarios. |
| Network errors cause data inconsistency | Medium | Medium | Implement idempotency in backend (use unique request ID). Add retry logic in frontend. Show clear error messages. |
| Backend is down (500 errors) | High | Low | Show error state with "Retry" button. Log errors to monitoring service. Set up backend health checks and alerts. |

## 8. Success Criteria

The migration is successful when:

1. ✅ **Multi-device sync works**: Data entered on one device/browser appears on another device/browser after reload.
2. ✅ **No localStorage reads for transactional data**: Frontend only reads `token` and `user` from localStorage. All other data comes from backend API.
3. ✅ **All pages load correctly**: Dashboard, customers, payments, sales pages display data from backend.
4. ✅ **CRUD operations work**: Create payment/refund requests, approve requests, add expenses, all save to backend.
5. ✅ **Loading and error states work**: Users see spinners during API calls and error messages on failure.
6. ✅ **No data loss**: Existing data (if migrated) is preserved and accessible.
7. ✅ **Performance is acceptable**: Pages load in <2 seconds with 1000+ records.
8. ✅ **Auth works**: JWT token is sent with all requests, 401 errors redirect to login.
9. ✅ **Backend tests pass**: Unit and integration tests for new expenses module and updated endpoints.
10. ✅ **Manual testing passes**: Admin and sales users can perform all workflows end-to-end.

---

## Document Version: 1.0
**Author**: Design Subagent  
**Date**: 2025-01-12  
**Review Status**: Draft — awaiting design review
