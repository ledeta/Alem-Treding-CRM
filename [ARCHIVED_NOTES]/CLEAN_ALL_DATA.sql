-- ============================================
-- CLEAN ALL CUSTOMERS AND ITEMS FROM DATABASE
-- ============================================
-- WARNING: This will DELETE ALL DATA permanently

-- Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Delete all sales transactions first (depends on items and customers)
DELETE FROM "SalesTransaction" CASCADE;
DELETE FROM "SalesTransactionItem" CASCADE;

-- Delete all items
DELETE FROM "Item" CASCADE;

-- Delete all customer balances
DELETE FROM "CustomerBalance" CASCADE;

-- Delete all customers
DELETE FROM "Customer" CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM "Customer") as customer_count,
  (SELECT COUNT(*) FROM "Item") as item_count,
  (SELECT COUNT(*) FROM "SalesTransaction") as transaction_count;

-- Reset auto-increment sequences
ALTER SEQUENCE "Customer_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Item_id_seq" RESTART WITH 1;
ALTER SEQUENCE "SalesTransaction_id_seq" RESTART WITH 1;

COMMIT;
