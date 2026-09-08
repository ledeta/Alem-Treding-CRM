#!/usr/bin/env pwsh

# ============================================
# CLEAN ALL ITEMS FROM DATABASE
# ============================================

Write-Host ""
Write-Host "=========================================="
Write-Host "DELETE ALL ITEMS FROM DATABASE"
Write-Host "=========================================="
Write-Host ""
Write-Host "WARNING: This will DELETE ALL items from the database"
Write-Host "This will also delete all sales transactions"
Write-Host "This action CANNOT BE UNDONE"
Write-Host ""

$confirm = Read-Host "Are you SURE? Type 'yes' to confirm"

if ($confirm -ne "yes") {
  Write-Host "Cleanup cancelled."
  exit 0
}

Write-Host ""
Write-Host "Connecting to database..."
Write-Host ""

# Create SQL cleanup script
$sqlScript = @"
SET session_replication_role = replica;

DELETE FROM "SalesTransaction" CASCADE;
DELETE FROM "SalesTransactionItem" CASCADE;
DELETE FROM "ItemStock" CASCADE;
DELETE FROM "Item" CASCADE;

SET session_replication_role = DEFAULT;

SELECT 
  (SELECT COUNT(*) FROM "Item") as remaining_items,
  (SELECT COUNT(*) FROM "SalesTransaction") as remaining_transactions;

COMMIT;
"@

# Save to temp file
$tempFile = "temp_items_cleanup.sql"
$sqlScript | Out-File -FilePath $tempFile -Encoding UTF8

try {
  # Execute psql
  & psql -U postgres -d alem_crm_db -f $tempFile
  
  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Items cleaned successfully!"
    Write-Host "All items and related transactions have been deleted."
    Write-Host ""
  } else {
    Write-Host ""
    Write-Host "❌ Error during cleanup."
    Write-Host ""
  }
}
catch {
  Write-Host "❌ Error: $_"
}
finally {
  # Clean up temp file
  if (Test-Path $tempFile) {
    Remove-Item $tempFile -Force
  }
}

Read-Host "Press Enter to exit"
