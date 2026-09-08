# Capacitor Initialization Script for ALEM Trading CRM Android App

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════╗"
Write-Host "║  ALEM Trading CRM - Android App Initialization        ║"
Write-Host "╚════════════════════════════════════════════════════════╝"
Write-Host ""

# Set Android Home
$env:ANDROID_HOME = "C:\Users\Milion's\AppData\Local\Android\Sdk"
Write-Host "✓ ANDROID_HOME set to: $env:ANDROID_HOME"
Write-Host ""

# Check if already initialized
if (Test-Path ".\android") {
    Write-Host "! Android folder already exists"
    Write-Host "? Do you want to reinitialize? (Y/N)"
    $response = Read-Host
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "✓ Keeping existing Android setup"
        exit 0
    }
    Remove-Item -Recurse -Force ".\android"
    Write-Host "✓ Removed existing Android folder"
}

Write-Host ""
Write-Host "Starting Capacitor initialization..."
Write-Host ""

# Run capacitor init with inputs
$process = Start-Process -FilePath "npx.cmd" -ArgumentList "cap", "init" -NoNewWindow -PassThru -RedirectStandardInput ".\input.txt" 2>&1

# Wait for process to complete
$process | Wait-Process

Write-Host ""
Write-Host "✓ Capacitor initialization started"
Write-Host ""
Write-Host "When prompted, enter:"
Write-Host "  App name: ALEM Trading CRM"
Write-Host "  App Package ID: com.alemtrading.crm"
Write-Host "  Web asset directory: ../frontend/out"
Write-Host ""
