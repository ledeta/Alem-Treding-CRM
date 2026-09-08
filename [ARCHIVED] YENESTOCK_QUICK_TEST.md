# 🎯 YeneStock Quick Test Guide

## Current Status
✅ YeneStock fully integrated with:
- 21 REST API endpoints
- 4 complete frontend pages
- 3 database tables with complete schema
- Real-time synchronization
- Complete documentation

---

## 🧪 Quick Test Checklist

### 1. Frontend Access
- [ ] Open http://localhost:3000
- [ ] Login with admin account
- [ ] Navigate to sidebar
- [ ] Look for 🏭 **YeneStock** menu
- [ ] Verify 4 submenu items appear:
  - [ ] Inventory Overview
  - [ ] Warehouse Locations
  - [ ] Stock Alerts
  - [ ] Analytics & Reports

### 2. Test YeneStock Pages

#### 2.1 Inventory Overview Page
URL: http://localhost:3000/yenestock
- [ ] Page loads without errors
- [ ] See real-time stock display
- [ ] Search functionality works
- [ ] Stock levels update in real-time
- [ ] Low stock items highlighted
- [ ] Out of stock items shown clearly

#### 2.2 Warehouse Locations Page
URL: http://localhost:3000/yenestock/locations
- [ ] See list of warehouse locations
- [ ] Main warehouse location visible
- [ ] Can view location details
- [ ] Location information displays correctly
- [ ] Stock levels per location shown

#### 2.3 Stock Alerts Page
URL: http://localhost:3000/yenestock/alerts
- [ ] Alert list displays
- [ ] Alert severity levels visible (Critical, High, Medium, Low)
- [ ] Stock threshold alerts working
- [ ] Expiry date alerts working
- [ ] Alert history available
- [ ] Can acknowledge/dismiss alerts

#### 2.4 Analytics & Reports Page
URL: http://localhost:3000/yenestock/reports
- [ ] 5 report types available:
  - [ ] Inventory Summary Report
  - [ ] Low Stock Items Report
  - [ ] Out of Stock Report
  - [ ] Inventory Value Report (in ብር)
  - [ ] Stock Turnover Analysis
- [ ] Reports generate without errors
- [ ] Can export/download reports
- [ ] Data calculations correct
- [ ] Charts display properly

### 3. API Testing (Backend)

Test these endpoints using Postman/curl:

#### 3.1 Inventory Endpoints
```bash
# Get all inventory
GET http://localhost:3001/api/yenestock/inventory

# Get inventory with location
GET http://localhost:3001/api/yenestock/inventory?location=main-warehouse

# Get low stock items
GET http://localhost:3001/api/yenestock/analytics/low-stock

# Get out of stock items
GET http://localhost:3001/api/yenestock/analytics/out-of-stock

# Get expired items
GET http://localhost:3001/api/yenestock/analytics/expired

# Get inventory value
GET http://localhost:3001/api/yenestock/analytics/inventory-value
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "itemId": "uuid",
      "quantity": 100,
      "minimumThreshold": 20,
      "maximumThreshold": 500,
      "reorderLevel": 50,
      "locationId": "uuid",
      "batchNumber": "BATCH-001",
      "expiryDate": "2026-12-31",
      "unitCost": 150,
      "createdAt": "2026-07-28T12:00:00Z",
      "updatedAt": "2026-07-28T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

#### 3.2 Location Endpoints
```bash
# Get all locations
GET http://localhost:3001/api/yenestock/locations

# Get main warehouse
GET http://localhost:3001/api/yenestock/locations/main-warehouse

# Create new location (Admin only)
POST http://localhost:3001/api/yenestock/locations
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "name": "Branch Office",
  "type": "branch",
  "address": "Addis Ababa, Ethiopia",
  "capacity": 5000
}
```

#### 3.3 Stock Movement Tracking
```bash
# Get stock movements
GET http://localhost:3001/api/yenestock/movements

# Record stock movement
POST http://localhost:3001/api/yenestock/movements
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "inventoryId": "uuid",
  "movementType": "OUTBOUND",
  "quantity": 50,
  "reason": "Sales Transaction TX-001",
  "notes": "Customer sale"
}
```

**Supported Movement Types**:
- INBOUND - Stock received
- OUTBOUND - Stock sold/removed
- TRANSFER - Move between locations
- ADJUSTMENT - Manual adjustment
- RETURN - Customer return
- LOSS - Stock loss
- DAMAGE - Damaged items

#### 3.4 Stock Alerts
```bash
# Get active alerts
GET http://localhost:3001/api/yenestock/alerts

# Get alert history
GET http://localhost:3001/api/yenestock/alerts/history

# Create custom alert (if supported)
POST http://localhost:3001/api/yenestock/alerts
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "inventoryId": "uuid",
  "alertType": "LOW_STOCK",
  "severity": "HIGH",
  "threshold": 25
}
```

### 4. Database Verification

Check tables created in PostgreSQL:

```sql
-- Check YeneStock tables
\dt public.yenestock*

-- Verify inventory table structure
SELECT * FROM yenestock_stock LIMIT 5;

-- Verify locations
SELECT * FROM yenestock_locations;

-- Verify movements for audit trail
SELECT * FROM yenestock_movements LIMIT 10;

-- Check data counts
SELECT 'yenestock_stock' as table_name, COUNT(*) as count FROM yenestock_stock
UNION ALL
SELECT 'yenestock_locations', COUNT(*) FROM yenestock_locations
UNION ALL
SELECT 'yenestock_movements', COUNT(*) FROM yenestock_movements;
```

### 5. Real-Time Features

- [ ] Open YeneStock page in two browser tabs
- [ ] Make an inventory change in tab 1
- [ ] Verify real-time update in tab 2 (via WebSocket)
- [ ] Stock levels sync automatically
- [ ] Alerts trigger in real-time

### 6. Integration Testing

- [ ] Create a sales transaction
- [ ] Verify stock quantity decreases automatically
- [ ] Check stock movement recorded in audit trail
- [ ] Verify alerts triggered if stock low
- [ ] Confirm notifications sent for critical alerts

---

## 🐛 Troubleshooting

### Frontend Not Showing YeneStock
1. Clear browser cache: Ctrl+Shift+Delete
2. Restart frontend dev server: Stop [32], restart
3. Check Sidebar.tsx has YeneStock menu items
4. Verify routing: `frontend/src/app/yenestock/`

### API Endpoints Returning 404
1. Check backend is running: `npm run start:dev`
2. Verify YeneStockModule registered in app.module.ts
3. Check database connection is working
4. Review backend logs for errors

### Database Tables Not Existing
1. Verify migrations ran
2. Check TypeORM sync is enabled
3. Review backend logs for table creation
4. Manually run migrations if needed:
   ```bash
   npm run typeorm migration:run
   ```

### Real-Time Updates Not Working
1. Check WebSocket connection
2. Verify socket.service.ts configuration
3. Check backend socket handlers
4. Review browser console for errors

---

## 📊 Expected Data

### Sample Inventory Items
- Various items with different stock levels
- Some items at low stock (< minimum threshold)
- Some items out of stock
- Items with expiry dates

### Sample Locations
- Main Warehouse (default)
- Branch locations (if configured)
- Distribution centers

### Sample Movements
- Full audit trail of all stock changes
- Shows who, what, when, why for each movement
- Complete history for compliance

---

## 📝 Documentation Reference

For detailed information:
- `🏭_YENESTOCK_README.md` - Complete overview
- `🏭_YENESTOCK_QUICK_START.md` - Setup guide
- `🏭_YENESTOCK_API_REFERENCE.md` - API endpoints
- `🧪_YENESTOCK_TESTING_GUIDE.md` - 40+ test scenarios
- `🚀_YENESTOCK_DEPLOYMENT_GUIDE.md` - Production deployment

---

## ✅ Sign-Off Checklist

When all tests pass:
- [ ] Frontend loads all 4 YeneStock pages
- [ ] API endpoints respond correctly
- [ ] Database tables contain expected data
- [ ] Real-time updates working
- [ ] Integrations with other modules working
- [ ] No console errors
- [ ] No API errors
- [ ] Alert system functioning

---

**Status**: ✅ READY FOR TESTING
**Estimated Test Time**: 30-45 minutes
**Difficulty**: Beginner-friendly with comprehensive UI
