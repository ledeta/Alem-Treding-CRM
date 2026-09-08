# ============================================
# AUTHENTICATE WITH GITHUB AND PUSH
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Authentication & Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Update PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Go to project directory
cd "C:\Users\Milion's\Desktop\Alem-Treding-main"

# Check if already authenticated
Write-Host "Checking GitHub authentication status..." -ForegroundColor Yellow
gh auth status 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Not authenticated with GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Starting GitHub authentication..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your browser will open. Follow these steps:" -ForegroundColor Yellow
    Write-Host "1. You'll see a GitHub authorization page" -ForegroundColor Yellow
    Write-Host "2. Click 'Authorize github' button" -ForegroundColor Yellow
    Write-Host "3. Return to PowerShell" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Enter to continue..." -ForegroundColor Cyan
    Read-Host
    
    Write-Host ""
    Write-Host "Opening GitHub authorization..." -ForegroundColor Cyan
    gh auth login --web
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Authentication failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
} else {
    Write-Host "✅ Already authenticated with GitHub" -ForegroundColor Green
}

Write-Host ""

# Check remote
Write-Host "Checking Git remote..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote already configured" -ForegroundColor Yellow
    git remote remove origin
    Write-Host "Removed old remote" -ForegroundColor Yellow
}

Write-Host ""

# Create repo and push
Write-Host "Creating repository and pushing code..." -ForegroundColor Cyan
Write-Host ""

gh repo create Alem-Tredint `
    --public `
    --source=. `
    --remote=origin `
    --push 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ========================================" -ForegroundColor Green
    Write-Host "✅ PUSH SUCCESSFUL!" -ForegroundColor Green
    Write-Host "✅ ========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Cyan
    Write-Host "2. Verify all files are uploaded" -ForegroundColor Cyan
    Write-Host "3. Go to: https://render.com" -ForegroundColor Cyan
    Write-Host "4. Connect your GitHub repository" -ForegroundColor Cyan
    Write-Host "5. Use QUICK_DEPLOY_STEPS.txt for Render deployment" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Documentation in repository:" -ForegroundColor Yellow
    Write-Host "- RENDER_FULL_ENVIRONMENT_SETUP.md" -ForegroundColor Yellow
    Write-Host "- QUICK_DEPLOY_STEPS.txt" -ForegroundColor Yellow
    Write-Host "- RENDER_DEPLOYMENT_CHECKLIST.md" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ ========================================" -ForegroundColor Red
    Write-Host "❌ PUSH FAILED" -ForegroundColor Red
    Write-Host "❌ ========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Check your internet connection" -ForegroundColor Yellow
    Write-Host "- Verify GitHub authentication: gh auth status" -ForegroundColor Yellow
    Write-Host "- Try again or check logs above" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
