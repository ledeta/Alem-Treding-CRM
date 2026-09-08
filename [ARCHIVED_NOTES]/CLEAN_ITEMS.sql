-- ============================================
-- DELETE ALL ITEMS FROM DATABASE
-- ============================================
-- WARNING: This will DELETE ALL items permanently

-- Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Delete all sales transactions first (depends on items)
DELETE FROM "SalesTransaction" CASCADE;
DELETE FROM "SalesTransactionItem" CASCADE;

-- Delete all items and their stock
DELETE FROM "ItemStock" CASCADE;
DELETE FROM "Item" CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM "Item") as remaining_items,
  (SELECT COUNT(*) FROM "SalesTransaction") as remaining_transactions;

-- Reset auto-increment sequences
ALTER SEQUENCE "Item_id_seq" RESTART WITH 1;
ALTER SEQUENCE "SalesTransaction_id_seq" RESTART WITH 1;

COMMIT;
