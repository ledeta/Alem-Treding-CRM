$ErrorActionPreference = "Stop"

$PSQL = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$PGUSER = "postgres"
$DBNAME = "alem_crm"
$SCHEMA_FILE = Join-Path $PSScriptRoot "database\schema.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ALEM CRM - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql exists
if (-not (Test-Path $PSQL)) {
    Write-Host "[X] PostgreSQL not found at: $PSQL" -ForegroundColor Red
    Write-Host "Please update the PSQL variable in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] PostgreSQL found" -ForegroundColor Green
Write-Host ""

# Create database
Write-Host "Creating database '$DBNAME'..." -ForegroundColor Yellow
$createCmd = "CREATE DATABASE $DBNAME;"
& $PSQL -U $PGUSER -c $createCmd 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "[i] Database may already exist, continuing..." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Database created" -ForegroundColor Green
}
Write-Host ""

# Load schema
Write-Host "Loading database schema..." -ForegroundColor Yellow
& $PSQL -U $PGUSER -d $DBNAME -f $SCHEMA_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   Database Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database: $DBNAME" -ForegroundColor White
    Write-Host "Tables: 18 created" -ForegroundColor White
    Write-Host "Views: 3 created" -ForegroundColor White
    Write-Host "Roles: Admin, Sales User" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[X] Schema loading failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
    exit 1
}
