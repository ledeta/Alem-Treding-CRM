# ============================================
# CREATE GITHUB REPOSITORY AND PUSH
# ============================================
# This script creates the repo and pushes code

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CREATE GITHUB REPO AND PUSH CODE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$GitHubUser = "ledeta"
$RepoName = "Alem-Tredint"
$ProjectPath = "C:\Users\Milion's\Desktop\Alem-Treding-main"

# Update PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Go to project
cd $ProjectPath

Write-Host "Step 1: Generating Personal Access Token Request" -ForegroundColor Yellow
Write-Host ""
Write-Host "You need to create a GitHub Personal Access Token:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor Cyan
Write-Host "3. Name: AlemTredintDeploy" -ForegroundColor Cyan
Write-Host "4. Expiration: 90 days" -ForegroundColor Cyan
Write-Host "5. Check ONLY: repo" -ForegroundColor Cyan
Write-Host "6. Click 'Generate token'" -ForegroundColor Cyan
Write-Host "7. COPY the long token string" -ForegroundColor Cyan
Write-Host ""

$GitHubToken = Read-Host "Paste your GitHub Personal Access Token here"

if ([string]::IsNullOrEmpty($GitHubToken)) {
    Write-Host "ERROR: No token provided" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Token received. Proceeding with repository creation..." -ForegroundColor Green
Write-Host ""

# Step 1: Create repository via GitHub API
Write-Host "Step 2: Creating GitHub Repository..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    "name" = $RepoName
    "description" = "ALEM Trading CRM System - Full-stack deployment"
    "private" = $false
    "auto_init" = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://api.github.com/user/repos" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✅ Repository created successfully!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "⚠️  Repository already exists - will push code to existing repo" -ForegroundColor Yellow
    } else {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 3: Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host ""

# Step 2: Configure git with token
$remoteUrl = "https://${GitHubUser}:${GitHubToken}@github.com/${GitHubUser}/${RepoName}.git"

git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $remoteUrl

# Step 3: Push
git branch -M main
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ==========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! CODE PUSHED TO GITHUB" -ForegroundColor Green
    Write-Host "✅ ==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: https://github.com/$GitHubUser/$RepoName" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Verify: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Cyan
    Write-Host "2. Go to: https://render.com" -ForegroundColor Cyan
    Write-Host "3. Connect your GitHub repository" -ForegroundColor Cyan
    Write-Host "4. Deploy using QUICK_DEPLOY_STEPS.txt" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ ERROR: Push failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check:" -ForegroundColor Yellow
    Write-Host "- Token is correct" -ForegroundColor Yellow
    Write-Host "- Token hasn't expired" -ForegroundColor Yellow
    Write-Host "- Internet connection" -ForegroundColor Yellow
    exit 1
}

# Clean up token
$GitHubToken = ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
