-- Get first customer and create sample transactions
WITH customer_data AS (
  SELECT id FROM customers ORDER BY id LIMIT 1
),
item_data AS (
  SELECT 1 as item_id UNION ALL SELECT 2 UNION ALL SELECT 3
),
user_data AS (
  SELECT 1 as user_id
)
INSERT INTO sales_transactions (
  "transactionId", "customerId", "itemId", quantity, "unitPrice", "totalAmount", 
  "transactionType", status, "transactionDate", "createdBy", branch, "isImported", "createdAt", "updatedAt"
)
SELECT
  'TXN-' || gen_random_uuid()::text,
  c.id,
  i.item_id,
  5,
  1000,
  5000,
  'Sale',
  'Completed',
  NOW() - INTERVAL '1 day' * (ROW_NUMBER() OVER ()),
  1,
  'Warehouse',
  true,
  NOW(),
  NOW()
FROM customer_data c, item_data i, user_data u
LIMIT 50;
