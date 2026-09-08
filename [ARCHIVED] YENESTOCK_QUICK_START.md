# 🏭 YeneStock Quick Start Guide

**Quick Access**: 🏭 YeneStock is now available in your sidebar under the main menu

---

## ⚡ 5-Minute Quick Setup

### Step 1: Access YeneStock
1. Login to your admin dashboard
2. Look for **🏭 YeneStock** in the left sidebar
3. Click to expand and see the submenu

### Step 2: Create Your First Warehouse Location
1. Go to **Warehouse Locations** (`/yenestock/locations`)
2. Click **➕ Add Location**
3. Fill in:
   - Location Code: `WH001`
   - Warehouse Name: `Main Warehouse`
   - City: `Addis Ababa`
   - Manager: Your manager name
   - Max Capacity: `5000` units
4. Click **Add Location**

### Step 3: Start Tracking Inventory
1. Go to **Inventory Overview** (`/yenestock`)
2. Click **View Details** on any inventory item
3. Check real-time stock levels and alerts
4. Filter by status or warehouse

### Step 4: Monitor Alerts
1. Go to **Stock Alerts** (`/yenestock/alerts`)
2. Review critical and high-priority alerts
3. Take action on low stock items

### Step 5: Generate Reports
1. Go to **Reports & Analytics** (`/yenestock/reports`)
2. Select report type (Summary, Movement, Expiry, etc.)
3. Choose date range
4. Click **📥 Export PDF** if needed

---

## 📊 Available Pages

| Page | Path | Purpose |
|------|------|---------|
| **Inventory Overview** | `/yenestock` | Main dashboard with all stock levels |
| **Warehouse Locations** | `/yenestock/locations` | Manage warehouses and distribution centers |
| **Stock Alerts** | `/yenestock/alerts` | Monitor critical stock issues |
| **Reports & Analytics** | `/yenestock/reports` | Generate detailed inventory reports |

---

## 🎯 Common Tasks

### Creating a New Inventory Record

**Via API:**
```bash
curl -X POST http://localhost:3001/yenestock/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "currentQuantity": 100,
    "minimumLevel": 10,
    "maximumLevel": 500,
    "reorderPoint": 15
  }'
```

**Via UI:**
1. Go to Inventory Overview
2. Click "Add Item" (if available in your version)
3. Fill in the form
4. Submit

### Recording a Stock Movement

**Record Inbound (Receiving):**
```bash
curl -X POST http://localhost:3001/yenestock/movements \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "movementType": "INBOUND",
    "quantity": 50,
    "referenceNo": "PO-2024-001"
  }'
```

**Record Outbound (Sale/Shipment):**
```bash
curl -X POST http://localhost:3001/yenestock/movements \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "movementType": "OUTBOUND",
    "quantity": 25,
    "reason": "Customer order"
  }'
```

### Transferring Stock Between Locations

```bash
curl -X POST http://localhost:3001/yenestock/movements \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "locationId": 1,
    "movementType": "TRANSFER",
    "quantity": 30,
    "fromLocationId": 1,
    "toLocationId": 2,
    "reason": "Rebalancing inventory"
  }'
```

---

## 🔔 Alert Types

| Icon | Alert Type | Meaning | Action |
|------|-----------|---------|--------|
| 🔴 | Critical | Out of stock or expired | Reorder immediately |
| 🟠 | High | Low stock level | Plan reorder |
| 🟡 | Medium | Approaching expiry | Monitor closely |
| 🟢 | Low | Minor warning | Track for future |

---

## 📊 Report Types

### 1. Inventory Summary
Shows total SKUs, quantities, locations, and stock value

**Use When**: Monthly inventory reviews, board reports

### 2. Stock Movement
Detailed log of all inbound, outbound, transfers, and adjustments

**Use When**: Audits, reconciliation, traceability

### 3. Expiry Analysis
Items expiring soon or already expired

**Use When**: Quality control, waste management

### 4. Inventory Value
Total value of inventory by location and item

**Use When**: Financial reporting, insurance claims

### 5. Stock Turnover
How fast items are moving and inventory optimization

**Use When**: Performance analysis, trend identification

---

## ⚙️ Best Practices

### 1. **Keep Stock Levels Accurate**
- Update reorder points based on sales patterns
- Perform regular physical counts
- Reconcile monthly with financial records

### 2. **Monitor Alerts Regularly**
- Check Stock Alerts dashboard daily
- Address critical alerts immediately
- Keep manager informed

### 3. **Use Batch Tracking**
- Always record batch numbers for traceable items
- Track expiry dates for perishables
- Maintain audit trail for compliance

### 4. **Plan Reorders Strategically**
- Review turnover reports quarterly
- Adjust minimum/maximum levels as needed
- Consider seasonal variations

### 5. **Maintain Location Capacity**
- Monitor warehouse capacity utilization
- Plan for growth and expansion
- Optimize storage efficiency

---

## 🔗 Integration with Other Modules

### With Items Module
- YeneStock extends basic item management
- Tracks actual stock across locations
- Supports multi-warehouse operations

### With Transactions Module
- Stock automatically decreases on sales
- Movements recorded in transaction history
- Links to payment and approval workflows

### With Notifications Module
- Receive alerts for low stock
- Get notifications for expiring items
- Critical alerts sent to managers

### With Dashboard Module
- View inventory metrics on dashboard
- Quick access to critical alerts
- Real-time stock status

---

## 📱 Mobile App Support

YeneStock is fully responsive and works on mobile devices:
- View inventory on the go
- Check stock levels from warehouse
- Receive push notifications for alerts
- Access reports anywhere

---

## 🆘 Troubleshooting

### Q: Where is YeneStock in the menu?
**A**: Only admins see YeneStock. Check your user role in Account Management.

### Q: Why can't I create a location?
**A**: You need admin privileges. Contact your system administrator.

### Q: How do I export a report?
**A**: Go to Reports, select your report type, choose dates, then click **📥 Export PDF**

### Q: What if stock level goes negative?
**A**: The system prevents this. You'll see an error "Insufficient stock" if trying to remove more than available.

### Q: How far back can I view movement history?
**A**: All movements are recorded indefinitely. Use date range filters in reports to focus on specific periods.

---

## 📞 Get Help

### Resources
- 📖 Full documentation: `🏭_YENESTOCK_INTEGRATION_COMPLETE.md`
- 🔧 API endpoints: See integration guide
- 💬 Chat support: Available in app

### Common Contacts
- **Inventory Manager**: Your assigned warehouse manager
- **Admin Support**: System administrator
- **Technical Issues**: Development team

---

## 🚀 Next Steps

1. ✅ Set up your warehouse locations
2. ✅ Configure reorder points for critical items
3. ✅ Create initial inventory records
4. ✅ Record first stock movements
5. ✅ Generate your first report
6. ✅ Set up alert notifications

---

**Ready to get started?** 🎯  
Go to **Sidebar → 🏭 YeneStock → Warehouse Locations** and create your first location!

---

*Last Updated: July 28, 2026*  
*Version: 1.0.0*
