-- Insert sample transactions for customers
-- This script adds transaction data to demonstrate the purchase history feature

-- First, get IDs (adjust these based on your actual data)
-- Customer IDs: 203-212 (the 10 newly added customers)
-- Item IDs: Will create items if they don't exist
-- User ID: 1 (usually the admin user)

-- Create sample items first (if not exists)
INSERT INTO items (name, "categoryId", "costPrice", price, stock, "reorderLevel", "unitsSold", description, "isActive", "createdAt", "updatedAt")
VALUES 
('Phone Screen Protector', NULL, 50, 150, 100, 10, 0, 'High quality screen protector', true, NOW(), NOW()),
('Phone Case', NULL, 80, 200, 50, 5, 0, 'Protective phone case', true, NOW(), NOW()),
('Charger Cable', NULL, 20, 50, 200, 20, 0, 'USB charger cable', true, NOW(), NOW()),
('Battery', NULL, 150, 300, 30, 5, 0, 'Replacement battery', true, NOW(), NOW()),
('Smartphone', NULL, 2000, 5000, 10, 2, 0, 'Latest smartphone model', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Get item IDs for use in transactions
WITH items_cte AS (
  SELECT id, name FROM items WHERE name IN ('Phone Screen Protector', 'Phone Case', 'Charger Cable', 'Battery', 'Smartphone')
)
-- Insert transactions for each customer
INSERT INTO sales_transactions (
  "transactionId", "customerId", "itemId", quantity, "unitPrice", "totalAmount", 
  "transactionType", status, "transactionDate", notes, "createdBy", 
  "discountAmount", "taxAmount", branch, "isImported", "createdAt", "updatedAt"
)
SELECT
  'TXN-' || gen_random_uuid()::text,
  c.id as customer_id,
  i.id as item_id,
  (RANDOM() * 5 + 1)::int as quantity,
  i.price as unit_price,
  ((RANDOM() * 5 + 1)::int * i.price) as total_amount,
  'Sale' as transaction_type,
  'Completed' as status,
  NOW() - (RANDOM() * 10 || ' days')::interval as transaction_date,
  'Sample transaction from import' as notes,
  1 as created_by,
  0 as discount_amount,
  0 as tax_amount,
  CASE WHEN RANDOM() > 0.5 THEN 'Warehouse' ELSE 'Shop' END as branch,
  true as is_imported,
  NOW() as created_at,
  NOW() as updated_at
FROM 
  (SELECT id FROM customers ORDER BY id LIMIT 10) c,
  items_cte i
WHERE RANDOM() > 0.3;  -- Add transactions for random combinations

-- Verify transactions were added
SELECT COUNT(*) as transaction_count FROM sales_transactions;
SELECT COUNT(DISTINCT "customerId") as customers_with_transactions FROM sales_transactions;
