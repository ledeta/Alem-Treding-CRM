# ALEM CRM System - Architecture Documentation

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  (Next.js Frontend - Desktop, Mobile, Tablet)                   │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
         ┌──────────▼────────────┐    ┌─────────▼─────────┐
         │  REST API Endpoints   │    │  WebSocket Events │
         │  (HTTP/HTTPS)         │    │  (Real-time)      │
         └──────────┬────────────┘    └────────┬──────────┘
                    │                          │
         ┌──────────▼──────────────────────────▼────────┐
         │      NestJS Backend Server (Port 3000)       │
         │  ┌──────────────────────────────────────┐   │
         │  │ Authentication & Authorization       │   │
         │  │ - JWT Authentication                │   │
         │  │ - Refresh Token Management          │   │
         │  │ - Role-Based Access Control (RBAC)  │   │
         │  └──────────────────────────────────────┘   │
         │  ┌──────────────────────────────────────┐   │
         │  │ Core Business Logic Modules           │   │
         │  │ - Customers                          │   │
         │  │ - Items/Inventory                    │   │
         │  │ - Sales Transactions                 │   │
         │  │ - Payment Requests                   │   │
         │  │ - Credit Management                  │   │
         │  │ - Refund Management                  │   │
         │  │ - Excel Data Import                  │   │
         │  │ - Real-time Chat                     │   │
         │  └──────────────────────────────────────┘   │
         │  ┌──────────────────────────────────────┐   │
         │  │ Data Access Layer (TypeORM)          │   │
         │  └──────────────────────────────────────┘   │
         └──────────────┬──────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼─────┐   ┌────▼─────┐   ┌────▼──────┐
   │PostgreSQL│   │  Redis   │   │  S3/File  │
   │ Database │   │  Cache   │   │  Storage  │
   └──────────┘   └──────────┘   └───────────┘
```

## 📦 Module Structure

### 1. **Authentication Module** (`/auth`)
- JWT-based authentication
- Refresh token rotation
- User session management
- Role initialization

**Key Files:**
- `auth.service.ts` - Core authentication logic
- `auth.controller.ts` - Authentication endpoints
- `jwt.strategy.ts` - JWT validation strategy

### 2. **Users Module** (`/users`)
- User account management
- User creation, update, deletion
- User status management
- Role assignment

**Key Files:**
- `users.service.ts` - User business logic
- `users.controller.ts` - User management endpoints

### 3. **Customers Module** (`/customers`)
- Customer CRUD operations
- Customer search and filtering
- Customer balance tracking
- Customer transaction history
- Inactivity monitoring (15+ days)

**Key Files:**
- `customers.service.ts` - Customer management
- `customers.controller.ts` - Customer endpoints
- `customer.entity.ts` - Customer model
- `customer-balance.entity.ts` - Balance tracking

### 4. **Items/Inventory Module** (`/items`)
- Item/product management
- Stock tracking
- SKU management
- Price management
- Low stock alerts

**Key Files:**
- `items.service.ts` - Item management
- `stock.service.ts` - Inventory tracking

### 5. **Sales Transactions Module** (`/transactions`)
- Sales record management
- Transaction history
- Customer purchase tracking
- Revenue calculations

### 6. **Payment Management Module** (`/payments`)
- Payment request creation
- Payment approval workflow
- Payment status tracking
- Bank integration support
- Audit trail for all payments

**Request Types:**
- Received Payment
- Credit Request
- Refund Request

### 7. **Uploads Module** (`/uploads`)
- Excel file upload handling
- Intelligent data detection
- Automatic column mapping
- Data validation and import

**Features:**
- XLSX/XLS support
- Duplicate prevention
- Error logging and reporting
- Batch processing

### 8. **Chat Module** (`/chat`)
- Real-time messaging via WebSockets
- Message history (latest 30 messages)
- Automatic cleanup of old messages
- Typing indicators
- Online status tracking
- Message reactions (emojis)
- File/image sharing

### 9. **Notifications Module** (`/notifications`)
- Real-time notifications
- Notification types:
  - File uploads
  - Payment requests
  - Credit requests
  - Refund requests
  - Approval results
  - Low stock alerts
- Read/unread tracking

### 10. **Dashboard Module** (`/dashboard`)
- KPI calculations and display
- Sales analytics
- Revenue trends
- Customer analytics
- Top customers
- Top selling items
- Activity tracking

## 🗄️ Database Design

### Core Tables

**Authentication & Access Control:**
- `roles` - Role definitions
- `users` - User accounts
- `refresh_tokens` - JWT refresh token storage

**Customer Management:**
- `customers` - Customer information
- `customer_balances` - Balance tracking
- `customer_no_visits` - Inactivity tracking

**Inventory:**
- `items` - Product catalog
- `stock` - Inventory levels
- `stock_transactions` - Stock movement history

**Sales & Transactions:**
- `sales_transactions` - Sales records

**Request Management:**
- `payment_requests` - Payment requests
- `credit_requests` - Credit requests
- `refund_requests` - Refund requests

**Supporting Tables:**
- `uploaded_files` - File upload tracking
- `chat_messages` - Chat message storage
- `notifications` - User notifications
- `audit_logs` - System audit trail

### Indexes Strategy

Performance indexes created on:
- User fields: username, email, role_id, status
- Customer fields: name, phone, customer_id, is_active, last_transaction_date
- Item fields: sku, category, is_active
- Transaction fields: customer_id, item_id, transaction_date
- Request fields: status, created_by, created_at

### Views for Common Queries

**customer_summary** - Aggregated customer data
**dashboard_kpis** - KPI metrics
**pending_approvals** - All pending requests in one view

## 🔐 Security Architecture

### Authentication Flow

```
1. User submits credentials (username/password)
   ↓
2. Backend validates credentials
   ↓
3. Password verified against Argon2 hash
   ↓
4. Account status checked (Active/Suspended/etc.)
   ↓
5. JWT access token generated (1 hour)
   ↓
6. Refresh token generated (7 days) and stored in DB
   ↓
7. Both tokens returned to client
   ↓
8. Client stores tokens securely
```

### Authorization Layers

1. **JWT Verification** - All protected endpoints require valid JWT
2. **Role-Based Access Control (RBAC)** - Endpoints decorated with required roles
3. **Database-Level Constraints** - Foreign keys, unique constraints, check constraints
4. **Audit Logging** - All critical operations logged

### Security Features

- **Password Hashing**: Argon2 algorithm
- **CSRF Protection**: Token validation
- **XSS Prevention**: Input sanitization, output encoding
- **SQL Injection Prevention**: Parameterized queries via TypeORM
- **Rate Limiting**: Configurable request throttling
- **Secure File Upload**: File type validation, virus scanning ready
- **CORS**: Configured for specific origins
- **Helmet.js**: Security headers middleware

## 🚀 Deployment Architecture

### Docker Composition

```
docker-compose.yml
├── PostgreSQL Service
│   ├── Port: 5432
│   ├── Volume: Persistent data
│   └── Environment: Database credentials
├── Redis Service
│   ├── Port: 6379
│   ├── Cache storage
│   └── Session management
├── Backend Service (NestJS)
│   ├── Port: 3000
│   ├── Depends on: PostgreSQL, Redis
│   └── Environment: Database, JWT, S3 credentials
├── Frontend Service (Next.js)
│   ├── Port: 3001
│   ├── Depends on: Backend
│   └── Environment: API URL
└── Nginx Service
    ├── Port: 80/443
    ├── Reverse proxy
    └── Load balancing
```

### Environment Variables

**Database:**
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

**JWT:**
- JWT_SECRET, JWT_EXPIRATION
- JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION

**Redis:**
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD

**Files:**
- UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_FILE_TYPES

**S3 (Optional):**
- AWS_S3_BUCKET, AWS_S3_REGION
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

**Server:**
- NODE_ENV, PORT, API_URL, FRONTEND_URL

## 📊 Data Flow Diagrams

### Excel Upload Flow

```
1. User selects Excel file
   ↓
2. File uploaded to backend
   ↓
3. File stored in S3/local storage
   ↓
4. Background job processes file
   ↓
5. ExcelJS parses file
   ↓
6. AI detection engine analyzes columns
   ↓
7. Data mapped to models
   ↓
8. Duplicate checking
   ↓
9. Validation
   ↓
10. Data inserted/updated
   ↓
11. Notification sent
```

### Payment Request Workflow

```
Sales User
   ↓
Creates Payment Request
   ↓
Submitted to Admin
   ↓
Admin Dashboard shows Pending
   ↓
Admin reviews details
   ↓
Admin approves/rejects
   ↓
Customer balance updated
   ↓
Audit log recorded
   ↓
Notifications sent
```

## 🔄 Real-Time Features

### WebSocket Events

**Client → Server:**
- `chat.message` - Send message
- `chat.typing` - Typing indicator
- `chat.online` - Online status

**Server → Client:**
- `chat.newMessage` - New message broadcast
- `notification.new` - New notification
- `refresh.required` - Client refresh needed

## 📈 Performance Optimization

1. **Database Indexing** - Strategic indexes on frequently queried fields
2. **Query Optimization** - Eager loading where needed, pagination
3. **Caching Strategy**:
   - Redis cache for frequently accessed data
   - Cache invalidation on updates
   - TTL-based expiration
4. **File Handling** - Async processing of large Excel files
5. **API Response** - Pagination, filtering, sorting capabilities
6. **Message Retention** - Automatic cleanup of old chat messages

## 🧪 Testing Strategy

### Test Coverage

- **Unit Tests**: Service and controller logic
- **Integration Tests**: Database and API integration
- **E2E Tests**: Complete user workflows

### Test Files Location

- `*.spec.ts` files alongside implementation

## 📝 API Documentation

- Swagger UI available at `/api/docs`
- All endpoints documented with:
  - Request/response schemas
  - Authentication requirements
  - Permission levels
  - Error codes

## 🔄 CI/CD Pipeline

Ready for integration with:
- GitHub Actions
- GitLab CI
- Jenkins
- Azure DevOps

**Pipeline Steps:**
1. Lint code
2. Run tests
3. Build Docker images
4. Push to registry
5. Deploy to staging/production
