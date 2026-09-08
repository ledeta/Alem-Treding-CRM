# 🏭 YeneStock API Reference

**Base URL**: `http://localhost:3001` (local) or `https://alem-treding-backend.onrender.com` (production)

---

## 🔐 Authentication

All endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📦 Inventory Endpoints

### Create Inventory Record

**POST** `/yenestock/inventory`

Creates a new inventory record for an item at a specific location.

**Request Body:**
```json
{
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": 100,
  "minimumLevel": 10,
  "maximumLevel": 500,
  "reorderPoint": 15,
  "warehouseCode": "WH001",
  "batchNumber": "BATCH-2024-001",
  "expiryDate": "2024-12-31T23:59:59Z",
  "notes": "Premium quality batch"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": "100.00",
  "minimumLevel": "10.00",
  "maximumLevel": "500.00",
  "reorderPoint": "15.00",
  "warehouseCode": "WH001",
  "batchNumber": "BATCH-2024-001",
  "expiryDate": "2024-12-31T23:59:59Z",
  "isExpired": false,
  "hasAlert": false,
  "lowStockAlertCount": 0,
  "lastRestocked": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Get All Inventory

**GET** `/yenestock/inventory?page=1&limit=20`

Retrieves paginated list of inventory records.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "itemId": 1,
      "locationId": 1,
      "currentQuantity": "100.00",
      "minimumLevel": "10.00",
      "maximumLevel": "500.00",
      "reorderPoint": "15.00",
      "warehouseCode": "WH001",
      "batchNumber": "BATCH-2024-001",
      "isExpired": false,
      "hasAlert": false,
      "lowStockAlertCount": 0,
      "lastRestocked": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8
}
```

---

### Get Inventory by ID

**GET** `/yenestock/inventory/:id`

Retrieves a specific inventory record.

**Response (200 OK):**
```json
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": "100.00",
  "minimumLevel": "10.00",
  "maximumLevel": "500.00",
  "reorderPoint": "15.00",
  "warehouseCode": "WH001",
  "batchNumber": "BATCH-2024-001",
  "isExpired": false,
  "hasAlert": false,
  "lowStockAlertCount": 0,
  "lastRestocked": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Inventory not found",
  "error": "Not Found"
}
```

---

### Get Inventory by Item and Location

**GET** `/yenestock/inventory/item/:itemId/location/:locationId`

Retrieves inventory for a specific item at a specific location.

**Response (200 OK):**
```json
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": "100.00",
  "minimumLevel": "10.00",
  "maximumLevel": "500.00",
  "reorderPoint": "15.00",
  "warehouseCode": "WH001",
  "batchNumber": "BATCH-2024-001",
  "isExpired": false,
  "hasAlert": false,
  "lowStockAlertCount": 0,
  "lastRestocked": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Get Inventory by Location

**GET** `/yenestock/inventory/location/:locationId?page=1&limit=20`

Retrieves all inventory items at a specific location.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "itemId": 1,
      "locationId": 1,
      "currentQuantity": "100.00",
      ...
    },
    {
      "id": 2,
      "itemId": 2,
      "locationId": 1,
      "currentQuantity": "50.00",
      ...
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

---

### Get Inventory by Item

**GET** `/yenestock/inventory/item/:itemId`

Retrieves all locations where an item is stocked.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "itemId": 1,
    "locationId": 1,
    "currentQuantity": "100.00",
    "warehouseCode": "WH001",
    ...
  },
  {
    "id": 2,
    "itemId": 1,
    "locationId": 2,
    "currentQuantity": "50.00",
    "warehouseCode": "WH002",
    ...
  }
]
```

---

### Update Inventory

**PUT** `/yenestock/inventory/:id`

Updates an existing inventory record.

**Request Body:**
```json
{
  "currentQuantity": 120,
  "minimumLevel": 12,
  "maximumLevel": 600,
  "reorderPoint": 18
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": "120.00",
  "minimumLevel": "12.00",
  "maximumLevel": "600.00",
  "reorderPoint": "18.00",
  ...
}
```

---

### Delete Inventory

**DELETE** `/yenestock/inventory/:id`

Soft deletes an inventory record (marks as inactive).

**Response (200 OK):**
```json
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": "100.00",
  "isActive": false,
  ...
}
```

---

## 🔄 Stock Movement Endpoints

### Record Stock Movement

**POST** `/yenestock/movements`

Records a stock movement transaction (inbound, outbound, transfer, adjustment, etc.)

**Request Body:**
```json
{
  "itemId": 1,
  "locationId": 1,
  "movementType": "INBOUND",
  "quantity": 50,
  "referenceNo": "PO-2024-001",
  "reason": "Supplier delivery",
  "fromLocationId": null,
  "toLocationId": null
}
```

**Movement Types:**
- `INBOUND` - Receiving goods
- `OUTBOUND` - Shipping goods
- `ADJUSTMENT` - Manual quantity adjustment
- `TRANSFER` - Moving between locations
- `RETURN` - Customer returns
- `LOSS` - Inventory loss/theft
- `DAMAGE` - Damaged goods

**Response (201 Created):**
```json
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "movementType": "INBOUND",
  "quantity": "50.00",
  "beforeQuantity": "100.00",
  "afterQuantity": "150.00",
  "referenceNo": "PO-2024-001",
  "reason": "Supplier delivery",
  "isApproved": false,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Get Stock Movements

**GET** `/yenestock/movements?itemId=1&locationId=1&page=1&limit=20`

Retrieves stock movement history with optional filters.

**Query Parameters:**
- `itemId` (optional): Filter by item
- `locationId` (optional): Filter by location
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "itemId": 1,
      "locationId": 1,
      "movementType": "INBOUND",
      "quantity": "50.00",
      "beforeQuantity": "100.00",
      "afterQuantity": "150.00",
      "referenceNo": "PO-2024-001",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "pages": 2
}
```

---

## 📍 Location Endpoints

### Create Location

**POST** `/yenestock/locations`

Creates a new warehouse location.

**Request Body:**
```json
{
  "code": "WH004",
  "warehouseName": "Regional Distribution Center",
  "address": "Hawassa, South Gate",
  "city": "Hawassa",
  "country": "Ethiopia",
  "isMainWarehouse": false,
  "maxCapacity": 2500,
  "managerName": "Mesfin Tekle",
  "managerPhone": "+251931234567",
  "managerEmail": "mesfin@alemtrading.com",
  "description": "Regional distribution and pickup point"
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "code": "WH004",
  "warehouseName": "Regional Distribution Center",
  "address": "Hawassa, South Gate",
  "city": "Hawassa",
  "country": "Ethiopia",
  "isMainWarehouse": false,
  "maxCapacity": 2500,
  "currentLoad": 0,
  "managerName": "Mesfin Tekle",
  "managerPhone": "+251931234567",
  "managerEmail": "mesfin@alemtrading.com",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Get All Locations

**GET** `/yenestock/locations?page=1&limit=20`

Retrieves all warehouse locations.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "WH001",
      "warehouseName": "Main Warehouse",
      "address": "Addis Ababa, Kebele 10",
      "city": "Addis Ababa",
      "country": "Ethiopia",
      "isMainWarehouse": true,
      "maxCapacity": 5000,
      "currentLoad": 2800,
      "managerName": "Abebe Kebede",
      "isActive": true,
      ...
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

---

### Get Location by ID

**GET** `/yenestock/locations/:id`

Retrieves a specific warehouse location.

**Response (200 OK):**
```json
{
  "id": 1,
  "code": "WH001",
  "warehouseName": "Main Warehouse",
  "address": "Addis Ababa, Kebele 10",
  "city": "Addis Ababa",
  "country": "Ethiopia",
  "isMainWarehouse": true,
  "maxCapacity": 5000,
  "currentLoad": 2800,
  "managerName": "Abebe Kebede",
  "managerPhone": "+251911234567",
  "managerEmail": "abebe@alemtrading.com",
  "isActive": true,
  ...
}
```

---

### Get Main Warehouse

**GET** `/yenestock/locations/warehouse/main`

Retrieves the main warehouse configuration.

**Response (200 OK):**
```json
{
  "id": 1,
  "code": "WH001",
  "warehouseName": "Main Warehouse",
  "isMainWarehouse": true,
  ...
}
```

---

### Update Location

**PUT** `/yenestock/locations/:id`

Updates a warehouse location.

**Request Body:**
```json
{
  "maxCapacity": 6000,
  "managerName": "New Manager Name"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "code": "WH001",
  "warehouseName": "Main Warehouse",
  "maxCapacity": 6000,
  "managerName": "New Manager Name",
  ...
}
```

---

### Delete Location

**DELETE** `/yenestock/locations/:id`

Soft deletes a warehouse location.

**Response (200 OK):**
```json
{
  "id": 1,
  "code": "WH001",
  "isActive": false,
  ...
}
```

---

## 📊 Analytics Endpoints

### Get Inventory Summary

**GET** `/yenestock/analytics/summary`

Gets comprehensive inventory summary statistics.

**Response (200 OK):**
```json
{
  "totalItems": 108,
  "totalQuantity": 2450,
  "lowStockCount": 12,
  "outOfStockCount": 3,
  "criticalItems": 5,
  "locationStats": {
    "1": {
      "quantity": 1250,
      "itemCount": 45,
      "lowStockCount": 4
    },
    "2": {
      "quantity": 680,
      "itemCount": 28,
      "lowStockCount": 5
    },
    "3": {
      "quantity": 520,
      "itemCount": 35,
      "lowStockCount": 3
    }
  }
}
```

---

### Get Low Stock Items

**GET** `/yenestock/analytics/low-stock?threshold=20`

Retrieves items below minimum stock level.

**Query Parameters:**
- `threshold` (optional): Custom threshold (default: minimumLevel)

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "itemId": 2,
    "locationId": 1,
    "currentQuantity": "8.00",
    "minimumLevel": "10.00",
    "itemName": "Cotton T-Shirt",
    "hasAlert": true
  }
]
```

---

### Get Out of Stock Items

**GET** `/yenestock/analytics/out-of-stock`

Retrieves all items with zero quantity.

**Response (200 OK):**
```json
[
  {
    "id": 3,
    "itemId": 3,
    "locationId": 2,
    "currentQuantity": "0.00",
    "itemName": "Denim Jeans",
    "minimumLevel": "15.00"
  }
]
```

---

### Get Expired Items

**GET** `/yenestock/analytics/expired-items`

Retrieves expired items.

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "itemId": 5,
    "locationId": 1,
    "currentQuantity": "5.00",
    "expiryDate": "2023-12-01",
    "isExpired": true
  }
]
```

---

### Get Inventory Cost

**GET** `/yenestock/analytics/inventory-cost`

Gets total inventory valuation.

**Response (200 OK):**
```json
{
  "totalInventoryItems": 108,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Search Inventory

**GET** `/yenestock/analytics/search?query=WH001&page=1&limit=20`

Searches inventory by warehouse code or batch number.

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "itemId": 1,
      "locationId": 1,
      "warehouseCode": "WH001",
      "batchNumber": "BATCH-2024-001",
      ...
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Prices cannot be negative",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Location not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Inventory already exists for this item at this location",
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

---

## 🧪 Example Usage

### Complete Workflow Example

```bash
# 1. Create a location
curl -X POST http://localhost:3001/yenestock/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WH005",
    "warehouseName": "Test Warehouse",
    "city": "Addis Ababa",
    "maxCapacity": 3000
  }'

# 2. Create inventory
curl -X POST http://localhost:3001/yenestock/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "currentQuantity": 100,
    "minimumLevel": 10,
    "maximumLevel": 500,
    "reorderPoint": 15
  }'

# 3. Record inbound movement
curl -X POST http://localhost:3001/yenestock/movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "movementType": "INBOUND",
    "quantity": 50,
    "referenceNo": "PO-2024-001"
  }'

# 4. Get summary
curl http://localhost:3001/yenestock/analytics/summary \
  -H "Authorization: Bearer $TOKEN"
```

---

**API Version**: 1.0.0  
**Last Updated**: July 28, 2026
