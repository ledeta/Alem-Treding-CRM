@echo off
REM ============================================
REM CLEAN ALL CUSTOMERS AND ITEMS FROM DATABASE
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo DATABASE CLEANUP TOOL
echo ==========================================
echo.
echo WARNING: This will DELETE ALL customers and items from the database
echo This action CANNOT BE UNDONE
echo.

set /p confirm="Are you SURE you want to delete all customers and items? (yes/no): "

if /i NOT "%confirm%"=="yes" (
  echo Cleanup cancelled.
  exit /b 0
)

echo.
echo Connecting to database...
echo.

REM Create the SQL cleanup script
(
  echo SET session_replication_role = replica;
  echo DELETE FROM "SalesTransaction" CASCADE;
  echo DELETE FROM "SalesTransactionItem" CASCADE;
  echo DELETE FROM "Item" CASCADE;
  echo DELETE FROM "CustomerBalance" CASCADE;
  echo DELETE FROM "Customer" CASCADE;
  echo SET session_replication_role = DEFAULT;
  echo SELECT COUNT(*) FROM "Customer" as remaining_customers;
  echo COMMIT;
) > temp_cleanup.sql

REM Execute the SQL script
psql -U postgres -d alem_crm_db -f temp_cleanup.sql

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Database cleaned successfully!
  echo All customers and items have been deleted.
  echo.
  del temp_cleanup.sql
) else (
  echo.
  echo ❌ Error during cleanup. Please check your database connection.
  echo.
  del temp_cleanup.sql
  exit /b 1
)

pause
