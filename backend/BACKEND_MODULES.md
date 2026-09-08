# ALEM CRM Backend Modules

Complete backend module documentation for ALEM CRM system built with NestJS, TypeORM, and Socket.IO.

## Table of Contents
1. [Customers Module](#customers-module)
2. [Uploads Module](#uploads-module)
3. [Dashboard Module](#dashboard-module)
4. [Approvals Module](#approvals-module)
5. [Chat Module](#chat-module)
6. [Notifications Module](#notifications-module)
7. [Architecture Overview](#architecture-overview)

---

## Customers Module

**Location:** `src/modules/customers/`

### Overview
Manages customer data with comprehensive search, filtering, and inactivity tracking capabilities.

### Files
- `customers.module.ts` - Module definition
- `customers.controller.ts` - API endpoints
- `customers.service.ts` - Business logic (pre-existing)
- `dto/customer.dto.ts` - Data transfer objects
- `entities/customer.entity.ts` - Database entity
- `entities/customer-balance.entity.ts` - Balance tracking

### Key Features
- **Search Functionality**: Search by name, phone, or customer ID
- **Pagination**: Configurable page/limit parameters
- **Inactivity Tracking**: Identify customers with no transactions in N days
- **Customer Profiles**: Detailed customer information with balance
- **Deactivation**: Soft delete capability for inactive customers
- **Balance Management**: Integrated credit, refund, and payment tracking

### API Endpoints
```
POST   /customers                    Create customer
GET    /customers                    List all customers (paginated)
GET    /customers/search             Search customers
GET    /customers/inactive           Get inactive customers
GET    /customers/:id                Get customer by ID
GET    /customers/:id/profile        Get detailed profile
GET    /customers/stats/active-count Get active customer count
PUT    /customers/:id                Update customer
DELETE /customers/:id                Deactivate customer
```

### Usage Example
```typescript
// Search customers
GET /customers/search?q=John&field=name&page=1&limit=10

// Get inactive customers (no transaction in 15 days)
GET /customers/inactive?days=15&page=1&limit=10

// Update customer
PUT /customers/1
{
  "name": "Updated Name",
  "phone": "+251911234567",
  "city": "Addis Ababa"
}
```

---

## Uploads Module

**Location:** `src/modules/uploads/`

### Overview
Handles Excel file uploads with automatic column detection, data validation, and duplicate prevention.

### Files
- `uploads.module.ts` - Module definition
- `uploads.controller.ts` - API endpoints
- `uploads.service.ts` - Core upload logic
- `dto/upload.dto.ts` - Data transfer objects
- `entities/uploaded-file.entity.ts` - Upload record storage

### Key Features
- **Auto Column Detection**: Automatically detects Excel columns
- **Smart Mapping**: Suggests column mappings based on content
- **Data Validation**: Comprehensive validation before import
- **Duplicate Prevention**: Prevents duplicate customer/item imports
- **Progress Tracking**: Monitor import status in real-time
- **Error Logging**: Detailed error logs for failed records
- **Batch Import**: Import multiple records efficiently
- **Support for**: Customers, Items, Transactions

### API Endpoints
```
POST   /uploads/detect-columns       Upload file and detect columns
POST   /uploads/:uploadId/validate   Validate import data
POST   /uploads/:uploadId/import     Execute import
GET    /uploads/history              Get upload history
GET    /uploads/:uploadId            Get upload details
```

### Usage Flow
```typescript
// Step 1: Upload file and detect columns
POST /uploads/detect-columns
FormData: { file, dataType: 'customers' }

Response:
{
  uploadId: 1,
  fileName: "customers.xlsx",
  dataType: "customers",
  detectedColumns: ["Name", "Phone", "Email", "City"],
  totalRows: 500,
  mapping: {
    "Name": "name",
    "Phone": "phone",
    "Email": "email",
    "City": "city"
  }
}

// Step 2: Validate import data
POST /uploads/1/validate
{
  columnMapping: {
    "Name": "name",
    "Phone": "phone",
    "Email": "email",
    "City": "city"
  }
}

Response:
{
  validRecords: 495,
  invalidRecords: 5,
  errors: [
    {
      row: 10,
      field: "email",
      error: "Invalid email format",
      value: "invalid-email"
    }
  ],
  duplicates: [
    {
      row: 15,
      matchedOn: "phone",
      matchedValue: "+251911234567",
      existingId: 42
    }
  ]
}

// Step 3: Execute import
POST /uploads/1/import
{
  columnMapping: { ... },
  skipDuplicates: true
}

Response:
{
  successCount: 495,
  failureCount: 5,
  skippedCount: 0,
  createdIds: [1, 2, 3, ...],
  completedAt: "2024-01-15T10:30:00Z"
}
```

### Supported Data Types
- **customers**: name, customerIdRef, phone, email, address, city, region, country
- **items**: name, code, category, unit, price, quantity, description
- **transactions**: customerId, itemId, date, amount, quantity, type, status

---

## Dashboard Module

**Location:** `src/modules/dashboard/`

### Overview
Real-time analytics and KPI dashboard with time-period filtering.

### Files
- `dashboard.module.ts` - Module definition
- `dashboard.controller.ts` - API endpoints
- `dashboard.service.ts` - Analytics logic
- `dto/dashboard.dto.ts` - Data transfer objects

### Key Features
- **KPI Calculations**: Total customers, sales, assets, net profit, pending payments
- **Time Periods**: Today, Week, Month, Quarter, Year, Custom date range
- **Charts**: Sales trends, customer distribution, top items/customers, payment status
- **Retention Metrics**: Customer retention rate and payment success rate
- **Recent Transactions**: Last N transactions with filtering
- **Pending Approvals**: Count of pending payment/credit/refund approvals
- **Real-time**: Generated on-demand with current data

### API Endpoints
```
GET    /dashboard                     Complete dashboard data
GET    /dashboard/kpis                Key performance indicators
GET    /dashboard/sales-trend         Sales trend data
GET    /dashboard/customer-distribution Customer distribution
GET    /dashboard/top-items           Top performing items
GET    /dashboard/top-customers       Top customers by sales
GET    /dashboard/payment-status      Payment status breakdown
GET    /dashboard/recent-transactions Recent transactions
GET    /dashboard/pending-approvals   Pending approvals count
```

### Usage Example
```typescript
// Get complete dashboard for current month
GET /dashboard?period=month

Response:
{
  kpis: {
    totalCustomers: 150,
    newCustomers: 12,
    totalSales: 1500000,
    totalAssets: 800000,
    netProfit: 700000,
    pendingPayments: 250000,
    outstandingCredits: 100000,
    pendingRefunds: 50000,
    averageTransactionValue: 10000,
    retentionRate: 92.5,
    paymentSuccessRate: 85
  },
  salesTrend: [
    { label: "Week 1", value: 350000, percentage: 23.3 },
    { label: "Week 2", value: 400000, percentage: 26.7 },
    ...
  ],
  topCustomers: [...],
  recentTransactions: [...]
}

// Get dashboard for custom date range
GET /dashboard?period=custom&startDate=2024-01-01&endDate=2024-01-31
```

### Time Periods
- **today**: Current day (00:00 - 23:59)
- **week**: Last 7 days
- **month**: Last 30 days
- **quarter**: Last 90 days
- **year**: Last 365 days
- **custom**: Custom date range (startDate & endDate required)

---

## Approvals Module

**Location:** `src/modules/approvals/`

### Overview
Workflow management for payment, credit, and refund approvals.

### Files
- `approvals.module.ts` - Module definition
- `approvals.controller.ts` - API endpoints
- `approvals.service.ts` - Business logic
- `dto/approval.dto.ts` - Data transfer objects
- `entities/approval.entity.ts` - Database entity

### Key Features
- **Approval Types**: Payment, Credit, Refund
- **Approval Status**: Pending, Approved, Rejected, Cancelled
- **Workflow Management**: Request → Review → Approve/Reject
- **Bulk Operations**: Approve multiple requests at once
- **Audit Trail**: Track who requested and approved
- **Statistics**: Approval metrics and average approval time
- **Filtering**: By type, status, customer, date range

### API Endpoints
```
POST   /approvals                     Create approval request
GET    /approvals                     Get all approvals (with filters)
GET    /approvals/pending             Get pending approvals
GET    /approvals/statistics          Get approval statistics
GET    /approvals/customer/:customerId Get customer approvals
GET    /approvals/:id                 Get approval by ID
PUT    /approvals/:id/approve         Approve or reject
POST   /approvals/bulk/approve        Bulk approve
DELETE /approvals/:id                 Cancel approval
PUT    /approvals/:id/notes           Update notes
```

### Usage Example
```typescript
// Create approval request
POST /approvals
{
  type: "payment",
  relatedId: 123,
  customerId: 45,
  amount: 5000,
  reason: "Weekly payment",
  requestedBy: 1
}

// Approve request
PUT /approvals/1/approve
{
  decision: "approved",
  reason: "Verified and approved",
  approvedBy: 2
}

// Get statistics
GET /approvals/statistics

Response:
{
  pendingCount: 5,
  approvedCount: 120,
  rejectedCount: 8,
  byType: {
    payment: 3,
    credit: 1,
    refund: 1
  },
  averageApprovalTime: 2.5  // hours
}
```

---

## Chat Module

**Location:** `src/modules/chat/`

### Overview
Real-time messaging with WebSocket support and automatic message retention.

### Files
- `chat.module.ts` - Module definition
- `chat.controller.ts` - REST API endpoints
- `chat.gateway.ts` - WebSocket gateway (Socket.IO)
- `chat.service.ts` - Business logic
- `dto/message.dto.ts` - Data transfer objects
- `entities/chat-message.entity.ts` - Message storage

### Key Features
- **Real-time Messaging**: WebSocket-based instant messaging
- **Message Retention**: Automatically keeps last 30 messages per conversation
- **Conversation Management**: Join/leave conversations
- **Message Types**: Text, File, System messages
- **Read Receipts**: Track message read status
- **Message Editing**: Edit own messages
- **Message Deletion**: Delete own messages
- **Typing Indicators**: Show when users are typing
- **Search**: Search messages within conversations
- **Direct Messages**: User-to-user private messaging

### REST API Endpoints
```
POST   /chat/conversation             Create new conversation
POST   /chat/messages                 Send message
GET    /chat/conversations/:convId/messages  Get conversation messages
GET    /chat/conversations/:convId/preview   Get conversation preview
GET    /chat/conversations            Get all user conversations
GET    /chat/conversations/:convId/search    Search messages
PUT    /chat/messages/:messageId      Edit message
DELETE /chat/messages/:messageId      Delete message
POST   /chat/messages/:messageId/read Mark as read
POST   /chat/conversations/:convId/mark-read Mark conversation as read
GET    /chat/conversations/:convId/unread-count Get unread count
POST   /chat/cleanup                  Cleanup old messages
```

### WebSocket Events

**Client → Server:**
```
join_conversation          Join a conversation
leave_conversation         Leave a conversation
send_message              Send a message
edit_message              Edit a message
delete_message            Delete a message
mark_read                 Mark message as read
mark_conversation_read    Mark all messages as read
typing                    Notify typing status
get_active_users          Get active users in conversation
direct_message            Send direct message to user
```

**Server → Client:**
```
message_received          New message received
message_edited            Message was edited
message_deleted           Message was deleted
message_read              Message marked as read
conversation_read         Conversation marked as read
user_typing              User is typing
user_joined              User joined conversation
user_left                User left conversation
user_online              User came online
user_offline             User went offline
direct_message           Direct message received
```

### Usage Example
```typescript
// REST: Send message
POST /chat/messages
{
  conversationId: "550e8400-e29b-41d4-a716-446655440000",
  message: "Hello, this is a test message",
  messageType: "text"
}

// WebSocket: Join conversation
socket.emit('join_conversation', {
  conversationId: "550e8400-e29b-41d4-a716-446655440000"
})

// WebSocket: Send message
socket.emit('send_message', {
  conversationId: "550e8400-e29b-41d4-a716-446655440000",
  message: "Hello everyone!",
  messageType: "text"
})

// WebSocket: Listen for new messages
socket.on('message_received', (message) => {
  console.log('New message:', message)
})

// WebSocket: Mark as read
socket.emit('mark_read', {
  messageId: 123,
  conversationId: "550e8400-e29b-41d4-a716-446655440000"
})
```

### Message Retention
- Automatically keeps last **30 messages** per conversation
- Older messages are automatically deleted when limit is exceeded
- Can manually cleanup messages older than N days

---

## Notifications Module

**Location:** `src/modules/notifications/`

### Overview
Real-time notifications system with WebSocket support for uploads, requests, and approvals.

### Files
- `notifications.module.ts` - Module definition
- `notifications.controller.ts` - API endpoints
- `notifications.gateway.ts` - WebSocket gateway
- `notifications.service.ts` - Business logic
- `dto/notification.dto.ts` - Data transfer objects
- `entities/notification.entity.ts` - Notification storage

### Key Features
- **Real-time Delivery**: WebSocket-based instant notifications
- **Notification Types**: Upload, Payment Request, Approval, Refund, Credit
- **Automatic Creation**: Triggered by system events
- **Read Tracking**: Track read/unread status
- **Bulk Operations**: Mark multiple as read/deleted
- **Broadcast**: Send to all users or specific user groups
- **Statistics**: Track by type and read status
- **Cleanup**: Auto-cleanup old notifications
- **Direct Links**: Action URLs to related records

### Notification Types
```typescript
enum NotificationType {
  UPLOAD = 'upload',                    // File import completed
  PAYMENT_REQUEST = 'payment_request',  // New payment request
  APPROVAL = 'approval',                // Request approved/rejected
  REFUND_REQUEST = 'refund_request',    // New refund request
  CREDIT_REQUEST = 'credit_request',    // New credit request
  SYSTEM = 'system'                     // System messages
}
```

### REST API Endpoints
```
POST   /notifications                  Create notification
GET    /notifications                  Get user notifications
GET    /notifications/statistics       Get statistics
GET    /notifications/unread-count     Get unread count
GET    /notifications/:id              Get notification by ID
POST   /notifications/:id/read         Mark as read
POST   /notifications/mark-all-read    Mark all as read
POST   /notifications/mark-many-read   Mark multiple as read
DELETE /notifications/:id              Delete notification
DELETE /notifications                  Delete multiple
POST   /notifications/cleanup          Cleanup old notifications
POST   /notifications/broadcast        Broadcast to admins
```

### WebSocket Events

**Client → Server:**
```
fetch_notifications       Fetch user notifications
mark_read                Mark notification as read
mark_all_read            Mark all as read
delete_notification      Delete notification
get_unread_count         Get unread count
get_statistics           Get user statistics
ping                     Test connection
```

**Server → Client:**
```
notification             New notification received
notifications_fetched    Notifications fetched
notification_read        Notification marked as read
all_notifications_read   All marked as read
notification_deleted     Notification deleted
unread_count            Unread count updated
statistics              User statistics
pong                    Connection test response
```

### Usage Example
```typescript
// REST: Get user notifications
GET /notifications?page=1&limit=10&isRead=false

Response:
{
  data: [
    {
      id: 1,
      type: "upload",
      title: "File Upload Completed",
      message: "Your Excel import completed: 495 success, 5 failed",
      relatedId: 1,
      relatedType: "upload",
      actionUrl: "/uploads/1",
      isRead: false,
      createdAt: "2024-01-15T10:30:00Z"
    },
    ...
  ],
  total: 5,
  page: 1,
  limit: 10,
  pages: 1
}

// WebSocket: Connect to notifications
const socket = io('/notifications', {
  query: { userId: 1, userName: 'John Doe' }
})

// WebSocket: Listen for notifications
socket.on('notification', (notification) => {
  console.log('New notification:', notification)
})

// WebSocket: Mark as read
socket.emit('mark_read', { notificationId: 1 })

// Get statistics
GET /notifications/statistics

Response:
{
  totalNotifications: 25,
  unreadCount: 3,
  readCount: 22,
  byType: {
    upload: 10,
    payment_request: 8,
    approval: 5,
    refund_request: 2
  }
}
```

---

## Architecture Overview

### Module Dependencies
```
Customers Module
    ↓
Uploads Module (depends on Customers for import)
    ↓
Dashboard Module (depends on Customers for KPIs)
    ↓
Approvals Module (independent - links to other modules)
    ↓
Chat Module (independent - WebSocket)
    ↓
Notifications Module (independent - WebSocket, publishes events)
```

### Database Schema
```
customers
├── id (PK)
├── name
├── phone
├── email
├── isActive
├── lastTransactionDate
└── ...

customer_balance
├── id (PK)
├── customerId (FK)
├── balance
├── creditAmount
├── refundAmount
└── ...

uploaded_files
├── id (PK)
├── fileName
├── uploadStatus
├── totalRecords
├── successfulRecords
├── dataType
├── uploadedById (FK)
└── ...

approvals
├── id (PK)
├── type (payment, credit, refund)
├── status (pending, approved, rejected)
├── customerId (FK)
├── relatedId
├── requestedBy (FK)
├── approvedBy (FK)
└── ...

chat_messages
├── id (PK)
├── conversationId (UUID)
├── senderId (FK)
├── message
├── isRead
├── createdAt
└── ...

notifications
├── id (PK)
├── userId (FK)
├── type (upload, payment_request, etc.)
├── title
├── message
├── relatedId
├── isRead
└── ...
```

### WebSocket Architecture
- **Namespace `/chat`**: For messaging (ChatGateway)
- **Namespace `/notifications`**: For notifications (NotificationsGateway)
- Both use Socket.IO with JWT authentication
- Auto-cleanup of connections on disconnect

### Error Handling
- Global HTTP exception filter
- Custom validation for DTOs
- Try-catch blocks in services
- Detailed error logging
- User-friendly error messages

### Performance Optimizations
- Paginated endpoints (default limit: 10)
- Database indexing on frequently queried fields
- Message retention limits (30 per conversation)
- Lazy loading of relations
- Query optimization with select/relations

---

## Installation & Setup

### Prerequisites
```bash
npm install @nestjs/common @nestjs/core
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/websockets socket.io
npm install exceljs class-validator class-transformer
npm install uuid
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=alem_crm

JWT_SECRET=your-secret-key

FRONTEND_URL=http://localhost:3000

NODE_ENV=development
```

### Running the Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## Best Practices

1. **Authentication**: All endpoints require JWT token (except /auth/login)
2. **Authorization**: Use RoleGuard for admin-only operations
3. **Validation**: Use class-validator DTOs for all inputs
4. **Logging**: Use Logger service for tracking operations
5. **Error Handling**: Catch exceptions and return meaningful messages
6. **Database**: Use transactions for multi-step operations
7. **Performance**: Always paginate list endpoints
8. **Security**: Validate and sanitize all user inputs

---

## Testing

Create `.spec.ts` files for each service/controller using Jest:
```typescript
describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersService],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

Run tests:
```bash
npm run test
npm run test:watch
npm run test:cov
```

---

## Support & Documentation

For detailed API documentation, see `/API_DOCUMENTATION.md`
For architecture details, see `/ARCHITECTURE.md`
