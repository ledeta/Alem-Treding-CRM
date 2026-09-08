# ============================================
# PUSH WITH PERSONAL ACCESS TOKEN
# ============================================
# This is the most reliable method

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PUSH TO GITHUB WITH TOKEN" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You need a GitHub Personal Access Token." -ForegroundColor Yellow
Write-Host ""
Write-Host "To get your token:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor Cyan
Write-Host "3. Name: AlemTredintDeploy" -ForegroundColor Cyan
Write-Host "4. Expiration: 90 days" -ForegroundColor Cyan
Write-Host "5. Scope: Check ONLY 'repo'" -ForegroundColor Cyan
Write-Host "6. Click 'Generate token'" -ForegroundColor Cyan
Write-Host "7. COPY the token (looks like: ghp_abc123...)" -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "Paste your GitHub Personal Access Token"

if ([string]::IsNullOrEmpty($token)) {
    Write-Host ""
    Write-Host "❌ No token provided - cannot proceed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Token received. Configuring Git and pushing..." -ForegroundColor Green
Write-Host ""

cd "C:\Users\Milion's\Desktop\Alem-Treding-main"

# Configure Git
git config --global user.name "ledeta"
git config --global user.email "ledeta@github.com"

# Remove old remote and add new one with token
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin "https://ledeta:$token@github.com/ledeta/Alem-Tredint.git"

# Verify remote
Write-Host "Remote configured" -ForegroundColor Green
Write-Host ""

# Set branch and push
Write-Host "Setting branch to main..." -ForegroundColor Yellow
git branch -M main

Write-Host "Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host "(This may take 30-60 seconds)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main --force 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ===========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! CODE PUSHED TO GITHUB!" -ForegroundColor Green
    Write-Host "✅ ===========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify your code:" -ForegroundColor Cyan
    Write-Host "→ https://github.com/ledeta/Alem-Tredint" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://render.com" -ForegroundColor Cyan
    Write-Host "2. Sign in with GitHub" -ForegroundColor Cyan
    Write-Host "3. Follow: QUICK_DEPLOY_STEPS.txt" -ForegroundColor Cyan
    Write-Host "4. Deploy frontend & backend" -ForegroundColor Cyan
    Write-Host "5. Go live! 🚀" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ ===========================================" -ForegroundColor Red
    Write-Host "❌ PUSH FAILED" -ForegroundColor Red
    Write-Host "❌ ===========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Verify token is correct and not expired" -ForegroundColor Yellow
    Write-Host "- Check token has 'repo' scope" -ForegroundColor Yellow
    Write-Host "- Ensure repository exists at GitHub" -ForegroundColor Yellow
    Write-Host "- Check internet connection" -ForegroundColor Yellow
    exit 1
}

# Clean up token from memory
$token = ""
