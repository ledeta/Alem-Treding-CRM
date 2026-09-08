-- Clean all customers and related data
-- Run this in your PostgreSQL client

-- Delete all transactions first (foreign key dependency)
DELETE FROM sales_transactions;

-- Delete all customer balances
DELETE FROM customer_balances;

-- Delete all customers
DELETE FROM customers;

-- Verify deletion
SELECT COUNT(*) as customers_remaining FROM customers;
SELECT COUNT(*) as transactions_remaining FROM sales_transactions;
SELECT COUNT(*) as balances_remaining FROM customer_balances;
