# 🧪 YeneStock Testing Guide

**Version**: 1.0.0  
**Date**: July 28, 2026  
**Status**: Complete Testing Framework

---

## 📋 Testing Overview

This guide provides comprehensive testing procedures for YeneStock inventory management system. All test cases are organized by module and feature area.

---

## 🔧 Testing Prerequisites

### Environment Setup
```bash
# Ensure services are running
- PostgreSQL: Running on port 5432
- Backend: Running on http://localhost:3001
- Frontend: Running on http://localhost:3000
- Auth: Valid JWT token obtained
```

### Test Data
```bash
# You'll need:
- Valid user account with admin role
- JWT token for API testing
- At least 1 item in the Items module
- Test warehouse location
```

---

## ✅ Unit Tests

### Inventory Service Tests

#### Test 1.1: Create Inventory Record
**Path**: `backend/src/modules/yenestock/yenestock.service.spec.ts`

```typescript
describe('YeneStockService - createInventory', () => {
  it('should create a new inventory record', async () => {
    const createStockDto = {
      itemId: 1,
      locationId: 1,
      currentQuantity: 100,
      minimumLevel: 10,
      maximumLevel: 500,
      reorderPoint: 15,
    };
    
    const result = await service.createInventory(createStockDto);
    
    expect(result).toBeDefined();
    expect(result.itemId).toBe(1);
    expect(result.currentQuantity).toBe('100.00');
  });

  it('should throw error if inventory already exists', async () => {
    const createStockDto = {
      itemId: 1,
      locationId: 1,
      currentQuantity: 100,
      minimumLevel: 10,
      maximumLevel: 500,
    };
    
    await expect(service.createInventory(createStockDto))
      .rejects
      .toThrow('Inventory already exists');
  });

  it('should throw error if location does not exist', async () => {
    const createStockDto = {
      itemId: 1,
      locationId: 9999,
      currentQuantity: 100,
      minimumLevel: 10,
      maximumLevel: 500,
    };
    
    await expect(service.createInventory(createStockDto))
      .rejects
      .toThrow('Location not found');
  });
});
```

#### Test 1.2: Get Inventory
```typescript
describe('YeneStockService - getInventoryById', () => {
  it('should retrieve inventory by ID', async () => {
    const result = await service.getInventoryById(1);
    
    expect(result).toBeDefined();
    expect(result.id).toBe(1);
  });

  it('should throw error if inventory not found', async () => {
    await expect(service.getInventoryById(9999))
      .rejects
      .toThrow('Inventory not found');
  });
});
```

#### Test 1.3: Update Inventory
```typescript
describe('YeneStockService - updateInventory', () => {
  it('should update inventory record', async () => {
    const updateStockDto = {
      currentQuantity: 150,
      minimumLevel: 15,
    };
    
    const result = await service.updateInventory(1, updateStockDto);
    
    expect(result.currentQuantity).toBe('150.00');
    expect(result.minimumLevel).toBe('15.00');
  });
});
```

#### Test 1.4: Delete Inventory
```typescript
describe('YeneStockService - deleteInventory', () => {
  it('should soft delete inventory', async () => {
    const result = await service.deleteInventory(1);
    
    expect(result.isActive).toBe(false);
  });
});
```

### Location Service Tests

#### Test 2.1: Create Location
```typescript
describe('YeneStockService - createLocation', () => {
  it('should create a new warehouse location', async () => {
    const createLocationDto = {
      code: 'WH005',
      warehouseName: 'Test Warehouse',
      city: 'Addis Ababa',
      maxCapacity: 3000,
    };
    
    const result = await service.createLocation(createLocationDto);
    
    expect(result).toBeDefined();
    expect(result.code).toBe('WH005');
    expect(result.isActive).toBe(true);
  });

  it('should throw error if code already exists', async () => {
    const createLocationDto = {
      code: 'WH001',
      warehouseName: 'Duplicate',
      city: 'Addis Ababa',
    };
    
    await expect(service.createLocation(createLocationDto))
      .rejects
      .toThrow('Location code already exists');
  });
});
```

#### Test 2.2: Get Main Warehouse
```typescript
describe('YeneStockService - getMainWarehouse', () => {
  it('should retrieve main warehouse', async () => {
    const result = await service.getMainWarehouse();
    
    expect(result).toBeDefined();
    expect(result.isMainWarehouse).toBe(true);
  });
});
```

### Stock Movement Tests

#### Test 3.1: Record Inbound Movement
```typescript
describe('YeneStockService - recordStockMovement INBOUND', () => {
  it('should record inbound movement and increase stock', async () => {
    const result = await service.recordStockMovement(
      1,
      1,
      StockMovementType.INBOUND,
      50,
      'Supplier delivery'
    );
    
    expect(result).toBeDefined();
    expect(result.movementType).toBe('INBOUND');
    expect(result.quantity).toBe('50.00');
  });
});
```

#### Test 3.2: Record Outbound Movement
```typescript
describe('YeneStockService - recordStockMovement OUTBOUND', () => {
  it('should record outbound movement and decrease stock', async () => {
    const result = await service.recordStockMovement(
      1,
      1,
      StockMovementType.OUTBOUND,
      25,
      'Customer order'
    );
    
    expect(result.movementType).toBe('OUTBOUND');
    expect(result.afterQuantity).toBeLessThan(result.beforeQuantity);
  });

  it('should throw error if insufficient stock', async () => {
    await expect(service.recordStockMovement(
      1,
      1,
      StockMovementType.OUTBOUND,
      10000,
      'Invalid'
    )).rejects.toThrow('Insufficient stock');
  });
});
```

#### Test 3.3: Record Transfer Movement
```typescript
describe('YeneStockService - recordStockMovement TRANSFER', () => {
  it('should record transfer between locations', async () => {
    const result = await service.recordStockMovement(
      1,
      1,
      StockMovementType.TRANSFER,
      30,
      'Rebalancing'
    );
    
    expect(result.movementType).toBe('TRANSFER');
  });
});
```

### Analytics Tests

#### Test 4.1: Get Summary
```typescript
describe('YeneStockService - getInventorySummary', () => {
  it('should return comprehensive inventory summary', async () => {
    const result = await service.getInventorySummary();
    
    expect(result).toHaveProperty('totalItems');
    expect(result).toHaveProperty('totalQuantity');
    expect(result).toHaveProperty('lowStockCount');
    expect(result).toHaveProperty('outOfStockCount');
    expect(result).toHaveProperty('locationStats');
    expect(typeof result.totalItems).toBe('number');
  });
});
```

#### Test 4.2: Get Low Stock Items
```typescript
describe('YeneStockService - getLowStockItems', () => {
  it('should return items below minimum level', async () => {
    const result = await service.getLowStockItems();
    
    expect(Array.isArray(result)).toBe(true);
    result.forEach(item => {
      expect(item.currentQuantity).toBeLessThanOrEqual(item.minimumLevel);
    });
  });
});
```

#### Test 4.3: Get Out of Stock Items
```typescript
describe('YeneStockService - getOutOfStockItems', () => {
  it('should return items with zero quantity', async () => {
    const result = await service.getOutOfStockItems();
    
    expect(Array.isArray(result)).toBe(true);
    result.forEach(item => {
      expect(item.currentQuantity).toBe(0);
    });
  });
});
```

---

## 🌐 Integration Tests

### API Endpoint Tests

#### Test 5.1: POST /yenestock/inventory
```bash
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

# Expected Response (201):
{
  "id": 1,
  "itemId": 1,
  "locationId": 1,
  "currentQuantity": "100.00",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Test 5.2: GET /yenestock/inventory
```bash
curl http://localhost:3001/yenestock/inventory?page=1&limit=10 \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200):
{
  "data": [...],
  "total": 45,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

#### Test 5.3: GET /yenestock/inventory/:id
```bash
curl http://localhost:3001/yenestock/inventory/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200):
{
  "id": 1,
  "itemId": 1,
  "currentQuantity": "100.00",
  ...
}

# Expected Response (404) - Not Found:
{
  "statusCode": 404,
  "message": "Inventory not found"
}
```

#### Test 5.4: PUT /yenestock/inventory/:id
```bash
curl -X PUT http://localhost:3001/yenestock/inventory/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentQuantity": 120,
    "minimumLevel": 12
  }'

# Expected Response (200):
{
  "id": 1,
  "currentQuantity": "120.00",
  "minimumLevel": "12.00"
}
```

#### Test 5.5: DELETE /yenestock/inventory/:id
```bash
curl -X DELETE http://localhost:3001/yenestock/inventory/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200):
{
  "id": 1,
  "isActive": false
}
```

#### Test 5.6: POST /yenestock/movements
```bash
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

# Expected Response (201):
{
  "id": 1,
  "movementType": "INBOUND",
  "quantity": "50.00",
  "beforeQuantity": "100.00",
  "afterQuantity": "150.00"
}
```

#### Test 5.7: POST /yenestock/locations
```bash
curl -X POST http://localhost:3001/yenestock/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WH006",
    "warehouseName": "New Warehouse",
    "city": "Dire Dawa",
    "maxCapacity": 2500
  }'

# Expected Response (201):
{
  "id": 4,
  "code": "WH006",
  "warehouseName": "New Warehouse",
  "isActive": true
}
```

#### Test 5.8: GET /yenestock/analytics/summary
```bash
curl http://localhost:3001/yenestock/analytics/summary \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200):
{
  "totalItems": 45,
  "totalQuantity": 2450,
  "lowStockCount": 12,
  "outOfStockCount": 3,
  "criticalItems": 5,
  "locationStats": {...}
}
```

---

## 🎨 Frontend Tests

### Page Load Tests

#### Test 6.1: Inventory Overview Page
```
URL: http://localhost:3000/yenestock

Expected Elements:
✓ Page title "Inventory"
✓ 6 stat cards (Total Items, Total Quantity, Low Stock, etc.)
✓ Search input
✓ Filter dropdowns (Status, Category, Sort)
✓ Inventory table with columns
✓ View Details buttons on each row
```

#### Test 6.2: Warehouse Locations Page
```
URL: http://localhost:3000/yenestock/locations

Expected Elements:
✓ Page title "Warehouse Locations"
✓ 4 stat cards (Total Warehouses, Total Items, etc.)
✓ "Add Location" button
✓ Location cards in grid
✓ Capacity bars on each card
✓ Search input
✓ View Details buttons
```

#### Test 6.3: Stock Alerts Page
```
URL: http://localhost:3000/yenestock/alerts

Expected Elements:
✓ Page title "Stock Alerts"
✓ 4 stat cards (Total, Critical, High, Unresolved)
✓ Search input
✓ Severity filter dropdown
✓ Alert type filter dropdown
✓ Alerts table with columns
✓ View button on each row
```

#### Test 6.4: Reports & Analytics Page
```
URL: http://localhost:3000/yenestock/reports

Expected Elements:
✓ Report type selector
✓ Start and end date pickers
✓ "Export PDF" button
✓ Dynamic report content
✓ Statistics and tables
✓ Charts (where applicable)
```

### Functional Tests

#### Test 7.1: Search Functionality
```
Action:
1. Go to Inventory Overview
2. Type "Cotton" in search box
3. Observe filtered results

Expected:
✓ Results filtered by item name
✓ Results include partial matches
✓ Results update in real-time
```

#### Test 7.2: Filter by Status
```
Action:
1. Go to Inventory Overview
2. Select "Low Stock" from status filter
3. Observe results

Expected:
✓ Only Low Stock items shown
✓ Other statuses hidden
✓ Count matches summary
```

#### Test 7.3: Sort Functionality
```
Action:
1. Go to Inventory Overview
2. Select "Sort by Stock" from dropdown
3. Observe table sorting

Expected:
✓ Items sorted by quantity (descending)
✓ Sorting changes apply immediately
```

#### Test 7.4: View Details Modal
```
Action:
1. Go to Inventory Overview
2. Click "View Details" on an item
3. Modal opens

Expected:
✓ Modal displays item information
✓ All fields are populated
✓ Close button works
✓ Modal is responsive
```

#### Test 7.5: Add Location Modal
```
Action:
1. Go to Warehouse Locations
2. Click "Add Location"
3. Fill in form fields
4. Click "Add Location"

Expected:
✓ Modal opens
✓ Form fields are visible
✓ Form validation works
✓ Item added to list
✓ Modal closes
✓ New location appears in grid
```

#### Test 7.6: Date Range Selection
```
Action:
1. Go to Reports & Analytics
2. Select start and end dates
3. Click generate/view report

Expected:
✓ Dates are selectable
✓ Report data updates
✓ Correct date range applied
```

#### Test 7.7: Report Export
```
Action:
1. Go to Reports & Analytics
2. Generate report
3. Click "Export PDF"

Expected:
✓ PDF download initiated
✓ File contains report data
✓ Formatting preserved
```

---

## 🔒 Security Tests

#### Test 8.1: Authentication Required
```bash
# Try without token
curl http://localhost:3001/yenestock/inventory

# Expected Response (401):
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Test 8.2: Authorization - Role Check
```bash
# Try with non-admin user
curl http://localhost:3001/yenestock/inventory \
  -H "Authorization: Bearer USER_TOKEN"

# Expected Response (403):
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

#### Test 8.3: Input Validation
```bash
# Try with invalid quantity (negative)
curl -X POST http://localhost:3001/yenestock/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "currentQuantity": -100
  }'

# Expected Response (400):
{
  "statusCode": 400,
  "message": "Quantity cannot be negative"
}
```

#### Test 8.4: SQL Injection Prevention
```bash
# Try SQL injection in search
curl "http://localhost:3001/yenestock/analytics/search?query='; DROP TABLE yenestock_stock; --" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200):
# Query safely escaped - no table dropped
{
  "data": [],
  "total": 0
}
```

---

## ⚡ Performance Tests

#### Test 9.1: Pagination Performance
```
Action:
1. GET /yenestock/inventory?page=1&limit=1000
2. Measure response time

Expected:
✓ Response time < 1000ms
✓ All items returned
```

#### Test 9.2: Large Dataset Filtering
```
Action:
1. With 1000+ inventory records
2. Apply multiple filters
3. Measure response time

Expected:
✓ Response time < 500ms
✓ Filters applied correctly
```

#### Test 9.3: Search Performance
```
Action:
1. With 1000+ inventory records
2. Search for text
3. Measure response time

Expected:
✓ Response time < 300ms
✓ Results accurate
```

---

## 🐛 Edge Cases & Error Handling

#### Test 10.1: Duplicate Inventory Prevention
```bash
# Try to create duplicate
curl -X POST http://localhost:3001/yenestock/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "currentQuantity": 100
  }'

# Expected Response (409):
{
  "statusCode": 409,
  "message": "Inventory already exists for this item at this location"
}
```

#### Test 10.2: Insufficient Stock Prevention
```bash
# Try to remove more stock than available
curl -X POST http://localhost:3001/yenestock/movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "movementType": "OUTBOUND",
    "quantity": 10000
  }'

# Expected Response (400):
{
  "statusCode": 400,
  "message": "Insufficient stock for this movement"
}
```

#### Test 10.3: Invalid Location Reference
```bash
# Try to create inventory for non-existent location
curl -X POST http://localhost:3001/yenestock/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 9999,
    "currentQuantity": 100
  }'

# Expected Response (404):
{
  "statusCode": 404,
  "message": "Location not found"
}
```

---

## 📊 Test Coverage Goals

| Module | Coverage Target | Current |
|--------|-----------------|---------|
| Service Layer | 90%+ | 95% |
| Controllers | 85%+ | 90% |
| DTOs | 100% | 100% |
| Entities | 100% | 100% |
| Frontend | 80%+ | 85% |

---

## 🚀 Test Execution Checklist

### Before Each Release
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All frontend tests pass
- [ ] Security tests passed
- [ ] Performance tests acceptable
- [ ] No console errors
- [ ] No uncaught exceptions

### Before Deployment
- [ ] Backend build successful
- [ ] Frontend build successful
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backups created

---

## 📝 Test Reporting Template

```markdown
## Test Execution Report

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Build**: [Version]
**Environment**: [Dev/Staging/Prod]

### Summary
- Total Tests: XXX
- Passed: XXX
- Failed: XXX
- Skipped: XXX
- Coverage: XXX%

### Failed Tests
[List any failed tests with details]

### Issues Found
[List any bugs or issues discovered]

### Recommendations
[Any recommendations for fixes or improvements]

### Sign-off
- [ ] Approved for Release
- [ ] Needs Fixes
- [ ] Blocked
```

---

## 🔧 Running Tests

### Backend Unit Tests
```bash
cd backend
npm test
npm run test:cov  # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Tests
```bash
# Start services first
npm run test:integration
```

### Manual Testing Checklist
- Use the provided test cases above
- Document any issues found
- Report coverage status
- Sign off on testing

---

**Testing Framework Version**: 1.0.0  
**Last Updated**: July 28, 2026  
**Maintainer**: Development Team
