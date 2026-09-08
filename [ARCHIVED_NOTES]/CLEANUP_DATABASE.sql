-- ========================================
-- CLEANUP SCRIPT: Delete All Customers and Transactions
-- ========================================
-- This script removes all existing customers and transactions from the database
-- to clean up the data before re-importing with the correct column mapping.
--
-- WARNING: This is DESTRUCTIVE and cannot be undone!
-- Backup your database before running this script.
-- ========================================

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Delete all sales transactions
DELETE FROM "sales_transactions";

-- Delete all customer balance records
DELETE FROM "customer_balance";

-- Delete all customers
DELETE FROM "customers";

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Verify deletions
SELECT 
  (SELECT COUNT(*) FROM "customers") as customer_count,
  (SELECT COUNT(*) FROM "customer_balance") as balance_count,
  (SELECT COUNT(*) FROM "sales_transactions") as transaction_count;

-- Output: All counts should be 0

COMMIT;
