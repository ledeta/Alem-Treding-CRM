# ALEM CRM System - API Documentation

**Base URL:** `http://localhost:3000/api`
**API Documentation (Swagger):** `http://localhost:3000/api/docs`

## 🔐 Authentication

All endpoints require JWT Bearer token authentication (except login).

### Login Request
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "SecurePassword123!"
}
```

### Login Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "Admin"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

## 👥 Users Endpoints

### Get All Users (Admin Only)
```http
GET /users?page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "john.doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "phone": "+251911234567",
      "role": "Admin",
      "status": "Active",
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

### Create User (Admin Only)
```http
POST /users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "sales.user",
  "email": "sales@example.com",
  "fullName": "Sales User",
  "phone": "+251911234567",
  "password": "SecurePassword123!",
  "roleId": 2
}
```

### Get User Profile
```http
GET /users/profile
Authorization: Bearer {accessToken}
```

### Update User (Admin Only)
```http
PUT /users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "Updated Name",
  "phone": "+251911234567"
}
```

### Update User Status (Admin Only)
```http
PUT /users/{userId}/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "Suspended"
}
```

**Valid Statuses:** `Active`, `Suspended`, `Released`, `Terminated`, `Deleted`

### Delete User (Admin Only)
```http
DELETE /users/{userId}
Authorization: Bearer {accessToken}
```

## 👤 Customers Endpoints

### Create Customer
```http
POST /customers
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Addis Ababa Trading Co.",
  "customerIdRef": "CUST001",
  "phone": "+251911234567",
  "email": "contact@company.com",
  "address": "Addis Ababa, Ethiopia",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "country": "Ethiopia",
  "source": "Excel Import"
}
```

### Get All Customers
```http
GET /customers?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Search Customers
```http
GET /customers/search?q=John&searchField=name&page=1&limit=10
Authorization: Bearer {accessToken}
```

**Search Fields:** `name`, `phone`, `customerIdRef`

### Get Customer by ID
```http
GET /customers/{customerId}
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "customerIdRef": "C001",
  "phone": "+251911234567",
  "email": "john@example.com",
  "address": "Addis Ababa",
  "isActive": true,
  "lastTransactionDate": "2024-01-15T10:30:00Z",
  "balance": {
    "balance": 5000.00,
    "creditAmount": 1000.00,
    "refundAmount": 0.00
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Update Customer
```http
PUT /customers/{customerId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+251911234567"
}
```

### Get No-Visit Customers (15+ Days)
```http
GET /customers/no-visits?page=1&limit=10
Authorization: Bearer {accessToken}
```

## 📦 Items/Inventory Endpoints

### Create Item
```http
POST /items
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU001",
  "description": "Product description",
  "category": "Electronics",
  "purchasePrice": 1000.00,
  "sellingPrice": 1500.00
}
```

### Get All Items
```http
GET /items?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Search Items
```http
GET /items/search?q=SKU001&searchField=sku
Authorization: Bearer {accessToken}
```

### Get Item Stock
```http
GET /items/{itemId}/stock
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": 1,
  "name": "Product Name",
  "sku": "SKU001",
  "category": "Electronics",
  "quantity": 100,
  "lowStockThreshold": 10,
  "purchasePrice": 1000.00,
  "sellingPrice": 1500.00,
  "isActive": true,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Update Stock
```http
PUT /items/{itemId}/stock
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "quantity": 150,
  "transactionType": "In",
  "reference": "Purchase Order #123"
}
```

## 💳 Payment Requests Endpoints

### Create Payment Request
```http
POST /payments/requests
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": 1,
  "amount": 5000.00,
  "bank": "Telebirr",
  "reason": "Payment for invoice #001",
  "requestDate": "2024-01-15",
  "requestTime": "10:30"
}
```

**Bank Options:** `Telebirr`, `CBE`, `Dashen Bank`, `Awash Bank`, `Abyssinia Bank`, `Wegagen Bank`, `Siinqee Bank`, `Other`

### Get All Payment Requests
```http
GET /payments/requests?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Get Pending Payment Requests (Admin Only)
```http
GET /payments/requests/pending?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Approve Payment Request (Admin Only)
```http
POST /payments/requests/{requestId}/approve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "notes": "Approved by admin"
}
```

### Reject Payment Request (Admin Only)
```http
POST /payments/requests/{requestId}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "notes": "Insufficient funds"
}
```

## 💰 Credit Requests Endpoints

### Create Credit Request
```http
POST /credits/requests
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": 1,
  "creditAmount": 5000.00,
  "reason": "Extension of payment terms",
  "requestDate": "2024-01-15",
  "requestTime": "10:30"
}
```

### Get All Credit Requests
```http
GET /credits/requests?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Approve Credit Request (Admin Only)
```http
POST /credits/requests/{requestId}/approve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "notes": "Approved based on credit history"
}
```

### Reject Credit Request (Admin Only)
```http
POST /credits/requests/{requestId}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "notes": "Credit limit exceeded"
}
```

## 🔙 Refund Requests Endpoints

### Create Refund Request
```http
POST /refunds/requests
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": 1,
  "itemId": 5,
  "quantity": 2,
  "refundAmount": 3000.00,
  "reason": "Defective product",
  "requestDate": "2024-01-15",
  "requestTime": "10:30"
}
```

### Get All Refund Requests
```http
GET /refunds/requests?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Approve Refund Request (Admin Only)
```http
POST /refunds/requests/{requestId}/approve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "notes": "Return authorized"
}
```

### Reject Refund Request (Admin Only)
```http
POST /refunds/requests/{requestId}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "notes": "Return period expired"
}
```

## 📤 File Upload Endpoints

### Upload Excel File
```http
POST /uploads/excel
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

[Binary file data]
```

**Response:**
```json
{
  "id": 1,
  "filename": "sales_data.xlsx",
  "fileSize": 1024000,
  "uploadedBy": 1,
  "processingStatus": "Processing",
  "uploadDate": "2024-01-15T10:30:00Z",
  "rowsProcessed": 0,
  "rowsFailed": 0
}
```

### Get Upload Status
```http
GET /uploads/{uploadId}
Authorization: Bearer {accessToken}
```

### Get All Uploads
```http
GET /uploads?page=1&limit=10
Authorization: Bearer {accessToken}
```

## 💬 Chat Endpoints

### Send Message
```http
POST /chat/messages
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "message": "Hello team!",
  "messageType": "text"
}
```

### Get Messages (Latest 30)
```http
GET /chat/messages?limit=30
Authorization: Bearer {accessToken}
```

### Add Reaction
```http
POST /chat/messages/{messageId}/reactions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reaction": "👍"
}
```

## 📊 Dashboard Endpoints

### Get KPI Dashboard
```http
GET /dashboard/kpis
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "totalCustomers": 150,
  "totalAssets": 500000.00,
  "totalSales": 1000000.00,
  "totalStockItems": 500,
  "netProfit": 200000.00,
  "totalCredit": 50000.00,
  "totalRefund": 10000.00,
  "pendingPayments": 12,
  "noVisitCustomers15Days": 25
}
```

### Get Sales Analytics
```http
GET /dashboard/analytics/sales?period=monthly
Authorization: Bearer {accessToken}
```

### Get Top Customers
```http
GET /dashboard/top-customers?limit=10
Authorization: Bearer {accessToken}
```

### Get Top Selling Items
```http
GET /dashboard/top-items?limit=10
Authorization: Bearer {accessToken}
```

### Get Recent Activities
```http
GET /dashboard/activities?limit=20
Authorization: Bearer {accessToken}
```

## 🔔 Notifications Endpoints

### Get Notifications
```http
GET /notifications?page=1&limit=10
Authorization: Bearer {accessToken}
```

### Mark as Read
```http
PUT /notifications/{notificationId}/read
Authorization: Bearer {accessToken}
```

### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer {accessToken}
```

### Delete Notification
```http
DELETE /notifications/{notificationId}
Authorization: Bearer {accessToken}
```

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid request parameters",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You don't have permission to access this resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Resource already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## 📝 Rate Limiting

- **API Rate Limit:** 10 requests per second
- **General Rate Limit:** 30 requests per second
- **Burst:** 20 requests allowed

Rate limit headers are returned in responses:
```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1705329000
```

## 🔄 WebSocket Events

### Client → Server Events

**Send Message:**
```javascript
socket.emit('chat.message', {
  message: 'Hello!',
  messageType: 'text'
});
```

**Typing Indicator:**
```javascript
socket.emit('chat.typing', {
  isTyping: true
});
```

**Online Status:**
```javascript
socket.emit('chat.online', {
  status: 'online'
});
```

### Server → Client Events

**Receive Message:**
```javascript
socket.on('chat.newMessage', (data) => {
  console.log(data);
  // {
  //   id: 1,
  //   sender: { id: 1, username: 'john' },
  //   message: 'Hello!',
  //   createdAt: '2024-01-15T10:30:00Z'
  // }
});
```

**New Notification:**
```javascript
socket.on('notification.new', (data) => {
  // {
  //   id: 1,
  //   type: 'PaymentRequest',
  //   title: 'New Payment Request',
  //   message: 'Customer requested payment approval'
  // }
});
```

## 🧪 Example Usage

### JavaScript/TypeScript with Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Login
const loginResponse = await api.post('/auth/login', {
  username: 'john.doe',
  password: 'SecurePassword123!'
});

const { accessToken } = loginResponse.data;
api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

// Get customers
const customersResponse = await api.get('/customers?page=1&limit=10');
console.log(customersResponse.data);

// Create payment request
const paymentResponse = await api.post('/payments/requests', {
  customerId: 1,
  amount: 5000,
  bank: 'Telebirr',
  reason: 'Invoice payment',
  requestDate: '2024-01-15',
  requestTime: '10:30'
});

console.log(paymentResponse.data);
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "SecurePassword123!"
  }'

# Get customers
curl -X GET http://localhost:3000/api/customers?page=1&limit=10 \
  -H "Authorization: Bearer {accessToken}"

# Create payment request
curl -X POST http://localhost:3000/api/payments/requests \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "amount": 5000,
    "bank": "Telebirr",
    "reason": "Invoice payment",
    "requestDate": "2024-01-15",
    "requestTime": "10:30"
  }'
```

## 📚 Additional Resources

- **Swagger UI:** http://localhost:3000/api/docs
- **Architecture:** See `ARCHITECTURE.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Database Schema:** See `database/schema.sql`
