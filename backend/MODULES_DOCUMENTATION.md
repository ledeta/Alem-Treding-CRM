# ALEM CRM System - Backend Modules Documentation

## Overview

This document provides comprehensive documentation for all backend modules created for the ALEM CRM system. All modules follow NestJS best practices with dependency injection, proper error handling, request validation, and role-based access control.

---

## 1. Items Module (`/backend/src/modules/items/`)

### Purpose
Manages inventory items, stock levels, and product information.

### Files
- `items.module.ts` - Module configuration
- `items.service.ts` - Business logic for item operations
- `items.controller.ts` - HTTP endpoints
- `dto/create-item.dto.ts` - DTO for item creation
- `dto/update-item.dto.ts` - DTO for item updates
- `entities/item.entity.ts` - Item database entity (pre-existing)
- `entities/stock.entity.ts` - Stock tracking entity (pre-existing)

### Key Features

#### CRUD Operations
- `POST /items` - Create a new item
- `GET /items` - Get all items with pagination
- `GET /items/:id` - Get item by ID
- `PUT /items/:id` - Update item details
- `DELETE /items/:id` - Soft delete item (sets isActive to false)

#### Search Operations
- `GET /items/search` - Search by name, SKU, or category
- `GET /items/search-by-name` - Search by item name
- `GET /items/search-by-sku` - Search by SKU
- `GET /items/search-by-category` - Search by category

#### Stock Management
- `GET /items/:id/stock` - Get stock information for an item
- `POST /items/:id/stock/update` - Update stock quantity
- `POST /items/:id/stock/increase` - Increase stock by quantity
- `POST /items/:id/stock/decrease` - Decrease stock by quantity
- `GET /items/stock/low` - Get low stock items (threshold: 10)
- `GET /items/stock/out-of-stock` - Get out-of-stock items
- `GET /items/categories` - Get all unique categories

### Data Model
```typescript
Item {
  id: number
  name: string
  sku: string (unique)
  description: string
  category: string
  purchasePrice: decimal
  sellingPrice: decimal
  isActive: boolean
  stock: Stock (one-to-one relation)
  createdAt: Date
  updatedAt: Date
}

Stock {
  id: number
  item: Item
  quantity: number
  lowStockThreshold: number
  lastUpdated: Date
}
```

### Validation Rules
- Item name: required, 2-255 characters
- SKU: optional, must be unique if provided
- Prices: must be non-negative
- Stock quantity: must be non-negative
- Reserved quantity cannot exceed quantity on hand

---

## 2. Payments Module (`/backend/src/modules/payments/`)

### Purpose
Manages customer payment requests and approvals.

### Files
- `payments.module.ts` - Module configuration
- `payments.service.ts` - Business logic for payment operations
- `payments.controller.ts` - HTTP endpoints
- `dto/create-payment.dto.ts` - DTO for payment creation
- `dto/update-payment.dto.ts` - DTOs for payment updates/approvals
- `entities/payment-request.entity.ts` - Payment database entity (pre-existing)

### Key Features

#### Core Operations
- `POST /payments` - Create new payment request
- `GET /payments` - Get all payments with pagination
- `GET /payments/:id` - Get payment by ID
- `PUT /payments/:id` - Update payment (pending only)
- `DELETE /payments/:id` - Delete payment (pending only)

#### Status Management
- `GET /payments/status/:status` - Get payments by status (Pending/Approved/Rejected)
- `POST /payments/:id/approve` - Approve payment request
- `POST /payments/:id/reject` - Reject payment request

#### Filtering & Search
- `GET /payments/customer/:customerId` - Get payments for specific customer
- `GET /payments/bank/:bank` - Get payments for specific bank
- `GET /payments/search` - Search payments by reason/bank/customer name
- `GET /payments/:customerId/total-approved` - Get total approved payments for customer

#### Statistics
- `GET /payments/statistics/pending-count` - Count pending payments
- `GET /payments/statistics/approved-count` - Count approved payments
- `GET /payments/statistics/rejected-count` - Count rejected payments

### Data Model
```typescript
PaymentRequest {
  id: number
  customer: Customer
  amount: decimal
  bank: enum ['Telebirr', 'CBE', 'Dashen Bank', ...]
  reason: string
  requestDate: Date
  requestTime: string
  status: enum ['Pending', 'Approved', 'Rejected']
  createdBy: User
  approvedBy: User (nullable)
  approvalDate: Date (nullable)
  notes: string (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Bank Options
- Telebirr
- CBE (Commercial Bank of Ethiopia)
- Dashen Bank
- Awash Bank
- Abyssinia Bank
- Wegagen Bank
- Siinqee Bank
- Other

### Validation Rules
- Amount: required, must be > 0.01
- Bank: required, must be in predefined list
- Status can only change from Pending to Approved or Rejected
- Only pending payments can be updated or deleted

---

## 3. Credits Module (`/backend/src/modules/credits/`)

### Purpose
Manages customer credit requests, approvals, and usage tracking.

### Files
- `credits.module.ts` - Module configuration
- `credits.service.ts` - Business logic for credit operations
- `credits.controller.ts` - HTTP endpoints
- `dto/create-credit.dto.ts` - DTO for credit creation
- `dto/update-credit.dto.ts` - DTOs for credit updates/approvals
- `entities/credit-request.entity.ts` - Credit database entity

### Key Features

#### Core Operations
- `POST /credits` - Create new credit request
- `GET /credits` - Get all credit requests with pagination
- `GET /credits/:id` - Get credit by ID
- `PUT /credits/:id` - Update credit (pending only)
- `DELETE /credits/:id` - Delete credit (pending only)

#### Status Management
- `GET /credits/status/:status` - Get credits by status (Pending/Approved/Rejected)
- `POST /credits/:id/approve` - Approve credit request
- `POST /credits/:id/reject` - Reject credit request

#### Credit Usage
- `POST /credits/:id/use` - Use approved credit
- `POST /credits/:id/reset` - Reset credit usage to 0
- `GET /credits/:customerId/available` - Get available credit for customer

#### Filtering & Search
- `GET /credits/customer/:customerId` - Get credits for specific customer
- `GET /credits/search` - Search credits by reason/description/customer
- `GET /credits/statistics/expiring` - Get credits expiring soon (default 7 days)

#### Statistics
- `GET /credits/statistics/pending-count` - Count pending credits
- `GET /credits/statistics/approved-count` - Count approved credits
- `GET /credits/statistics/total-approved` - Get total approved credit amount

### Data Model
```typescript
CreditRequest {
  id: number
  customer: Customer
  requestedAmount: decimal
  approvedAmount: decimal
  reason: string
  description: string
  status: enum ['Pending', 'Approved', 'Rejected']
  expiryDate: Date (nullable)
  usedAmount: decimal (default: 0)
  createdBy: User
  approvedBy: User (nullable)
  approvalDate: Date (nullable)
  notes: string (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Validation Rules
- Requested amount: required, must be > 0.01
- Approved amount: must not exceed requested amount
- Used amount cannot exceed approved amount
- Credits expire after expiryDate
- Only pending credits can be updated/deleted
- Only approved, non-expired credits can be used

---

## 4. Refunds Module (`/backend/src/modules/refunds/`)

### Purpose
Manages refund requests with inventory updates and approval workflow.

### Files
- `refunds.module.ts` - Module configuration
- `refunds.service.ts` - Business logic for refund operations
- `refunds.controller.ts` - HTTP endpoints
- `dto/create-refund.dto.ts` - DTO for refund creation
- `dto/update-refund.dto.ts` - DTOs for refund updates/approvals
- `entities/refund-request.entity.ts` - Refund database entity

### Key Features

#### Core Operations
- `POST /refunds` - Create new refund request
- `GET /refunds` - Get all refund requests with pagination
- `GET /refunds/:id` - Get refund by ID
- `PUT /refunds/:id` - Update refund (pending only)
- `DELETE /refunds/:id` - Delete refund (pending only)

#### Status Management
- `GET /refunds/status/:status` - Get refunds by status (Pending/Approved/Rejected/Completed)
- `POST /refunds/:id/approve` - Approve refund (with optional inventory update)
- `POST /refunds/:id/reject` - Reject refund
- `POST /refunds/:id/complete` - Complete approved refund

#### Filtering & Search
- `GET /refunds/customer/:customerId` - Get refunds for specific customer
- `GET /refunds/item/:itemId` - Get refunds for specific item
- `GET /refunds/search` - Search refunds by reason/item/customer

#### Statistics
- `GET /refunds/statistics/pending-count` - Count pending refunds
- `GET /refunds/statistics/approved-count` - Count approved refunds
- `GET /refunds/statistics/completed-count` - Count completed refunds
- `GET /refunds/statistics/total-amount` - Get total refund amount
- `GET /refunds/statistics/pending-inventory-update` - Get refunds awaiting inventory update

### Data Model
```typescript
RefundRequest {
  id: number
  customer: Customer
  item: Item
  quantity: number
  refundAmount: decimal
  reason: string
  description: string
  status: enum ['Pending', 'Approved', 'Rejected', 'Completed']
  isInventoryUpdated: boolean
  createdBy: User
  approvedBy: User (nullable)
  approvalDate: Date (nullable)
  completionDate: Date (nullable)
  notes: string (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Validation Rules
- Quantity: required, must be > 0
- Refund amount: required, must be > 0
- Only pending refunds can be updated/deleted
- Approved refunds can have inventory updated
- Only approved refunds can be completed
- Inventory automatically updated on approval if requested

---

## 5. Transactions Module (`/backend/src/modules/transactions/`)

### Purpose
Records all sales, refunds, and financial transactions with comprehensive history and reporting.

### Files
- `transactions.module.ts` - Module configuration
- `transactions.service.ts` - Business logic for transaction operations
- `transactions.controller.ts` - HTTP endpoints
- `dto/create-transaction.dto.ts` - DTO for transaction creation
- `entities/sales-transaction.entity.ts` - Transaction database entity

### Key Features

#### Core Operations
- `POST /transactions` - Record new sales transaction
- `GET /transactions` - Get all transactions with pagination
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/by-txn-id/:transactionId` - Get transaction by transaction ID
- `PUT /transactions/:id/status` - Update transaction status

#### Filtering & Search
- `GET /transactions/by-customer/:customerId` - Get transactions for customer
- `GET /transactions/by-item/:itemId` - Get transactions for item
- `GET /transactions/by-type/:type` - Get transactions by type (Sale/Refund/Credit/Payment)
- `GET /transactions/by-status/:status` - Get transactions by status
- `GET /transactions/date-range` - Get transactions within date range
- `GET /transactions/search` - Search transactions

#### Reporting & Analytics
- `GET /transactions/history/:customerId` - Get transaction history with date filtering
- `GET /transactions/statistics/total-sales` - Total sales amount
- `GET /transactions/statistics/total-refunds` - Total refund amount
- `GET /transactions/statistics/count` - Transaction count with type/status filtering
- `GET /transactions/statistics/daily-report` - Daily sales report for date range

### Data Model
```typescript
SalesTransaction {
  id: number
  transactionId: string (unique, auto-generated)
  customer: Customer
  item: Item
  quantity: number
  unitPrice: decimal
  totalAmount: decimal
  transactionType: enum ['Sale', 'Refund', 'Credit', 'Payment']
  status: enum ['Pending', 'Completed', 'Cancelled']
  transactionDate: Date
  discountAmount: decimal (default: 0)
  taxAmount: decimal (default: 0)
  notes: string (nullable)
  createdBy: User
  referenceId: number (nullable)
  referenceType: string (nullable, e.g., 'payment', 'refund', 'credit')
  createdAt: Date
  updatedAt: Date
}
```

### Transaction Types
- **Sale**: Regular product sale (decreases inventory)
- **Refund**: Customer refund (increases inventory)
- **Credit**: Credit transaction
- **Payment**: Payment transaction

### Validation Rules
- Quantity: required, must be > 0
- Unit price: required, must be > 0
- For sales: check sufficient stock before transaction
- For refunds: increase inventory after transaction
- Total amount = (quantity × unitPrice) - discount + tax
- Only pending transactions can be updated

### Features
- Auto-generates unique transaction IDs (format: TXN-{timestamp}-{random})
- Automatic stock management for sales and refunds
- Discount and tax calculation support
- Reference tracking to linked payments/refunds/credits
- Comprehensive history and reporting capabilities

---

## Common Features Across All Modules

### Authentication & Authorization
- All endpoints require JWT authentication via `@UseGuards(JwtAuthGuard)`
- Bearer token required in Authorization header
- Public routes can be marked with `@Public()` decorator

### Error Handling
- Standardized error responses
- Proper HTTP status codes
- Meaningful error messages
- Validation errors from class-validator

### Validation
- Request validation using class-validator decorators
- DTOs validate incoming data
- Business logic validates state transitions
- Database constraints enforce data integrity

### Pagination
- All list endpoints support pagination
- Query parameters: `page` (default: 1), `limit` (default: 10)
- Response includes: data, total, page, limit, pages

### Logging
- Service-level logging via NestJS Logger
- Important operations logged with context
- Helps with debugging and audit trails

### Database
- All modules use TypeORM with PostgreSQL
- Proper relationships with foreign keys
- Created/Updated timestamps on all entities
- Indexes on frequently queried fields

---

## API Response Format

### Success Response
```json
{
  "data": { /* entity or list of entities */ },
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## Module Dependencies

```
items.module
├── Item entity
└── Stock entity

payments.module
├── PaymentRequest entity
├── Customer entity
└── User entity

credits.module
├── CreditRequest entity
├── Customer entity
└── User entity

refunds.module
├── RefundRequest entity
├── Item entity (via ItemsModule)
├── Customer entity
└── User entity

transactions.module
├── SalesTransaction entity
├── Item entity (via ItemsModule)
├── Customer entity
└── User entity
```

---

## Getting Started

### Installation
All dependencies are already configured in package.json. Run:
```bash
npm install
```

### Database Setup
Ensure PostgreSQL is running and the database is created. TypeORM will auto-sync entities in development mode.

### Running the Application
```bash
npm run start:dev
```

### Testing Endpoints
Use Postman or similar tool with:
- Base URL: `http://localhost:3000/api`
- Authorization Header: `Bearer {JWT_TOKEN}`

---

## Next Steps

1. **Complete remaining modules** (uploads, chat, notifications, dashboard, approvals)
2. **Add role-based access control** to protect sensitive operations
3. **Implement Excel import** for bulk operations
4. **Add comprehensive testing** for all modules
5. **Set up API documentation** with Swagger
6. **Implement caching** for frequently accessed data

---

## Support

For issues or questions regarding any module, refer to the respective service files for implementation details or contact the development team.
