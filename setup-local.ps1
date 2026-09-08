# ALEM CRM System - Local Setup Script
# Run this script to setup the project locally

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALEM CRM System - Local Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ npm $npmVersion installed" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$psqlTest = psql --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL installed" -ForegroundColor Green
    Write-Host "  $psqlTest" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL not found. Please install from https://www.postgresql.org/download/" -ForegroundColor Red
    Write-Host "  After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "All prerequisites installed!" -ForegroundColor Green
Write-Host ""

# Setup Backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path (Get-Location) "backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    if ((Test-Path "node_modules") -eq $false) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
    }
    
    Write-Host "✓ Backend setup complete" -ForegroundColor Green
    Set-Location ".."
} else {
    Write-Host "✗ Backend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Setup Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = Join-Path (Get-Location) "frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    if ((Test-Path "node_modules") -eq $false) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
    }
    
    Write-Host "✓ Frontend setup complete" -ForegroundColor Green
    Set-Location ".."
} else {
    Write-Host "✗ Frontend directory not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create PostgreSQL database:" -ForegroundColor White
Write-Host "   psql -U postgres -c 'CREATE DATABASE alem_crm;'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Initialize database schema:" -ForegroundColor White
Write-Host "   psql -U postgres -d alem_crm -f database/schema.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Start Backend (in Terminal 1):" -ForegroundColor White
Write-Host "   cd backend && npm run start:dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Start Frontend (in Terminal 2):" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Access Application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see: LOCAL_SETUP.md" -ForegroundColor Yellow
Write-Host ""
