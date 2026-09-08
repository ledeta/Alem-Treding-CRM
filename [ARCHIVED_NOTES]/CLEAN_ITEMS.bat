@echo off
REM ============================================
REM CLEAN ALL ITEMS FROM DATABASE
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo DELETE ALL ITEMS FROM DATABASE
echo ==========================================
echo.
echo WARNING: This will DELETE ALL items from the database
echo This will also delete all sales transactions linked to items
echo This action CANNOT BE UNDONE
echo.

set /p confirm="Are you SURE you want to delete all items? (yes/no): "

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
  echo DELETE FROM "ItemStock" CASCADE;
  echo DELETE FROM "Item" CASCADE;
  echo SET session_replication_role = DEFAULT;
  echo SELECT COUNT(*) FROM "Item" as remaining_items;
  echo COMMIT;
) > temp_items_cleanup.sql

REM Execute the SQL script
psql -U postgres -d alem_crm_db -f temp_items_cleanup.sql

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Items deleted successfully!
  echo All items and related transactions have been removed.
  echo.
  del temp_items_cleanup.sql
) else (
  echo.
  echo ❌ Error during cleanup. Please check your database connection.
  echo.
  del temp_items_cleanup.sql
  exit /b 1
)

pause
