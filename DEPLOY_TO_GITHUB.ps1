# ============================================
# AGGRESSIVE GITHUB DEPLOYMENT SCRIPT
# ============================================
# This script creates the repository and pushes all code to GitHub
# 
# Usage: .\DEPLOY_TO_GITHUB.ps1 -GitHubToken "your_token_here"
# Or: .\DEPLOY_TO_GITHUB.ps1 (will prompt for token)

param(
    [string]$GitHubToken = ""
)

# Configuration
$GitHubUser = "ledeta"
$RepoName = "Alem-Tredint"
$ProjectPath = "C:\Users\Milion's\Desktop\Alem-Treding-main"

# Colors for output
$Success = "Green"
$Error = "Red"
$Warning = "Yellow"
$Info = "Cyan"

Write-Host "==========================================" -ForegroundColor $Info
Write-Host "AGGRESSIVE GITHUB DEPLOYMENT" -ForegroundColor $Info
Write-Host "==========================================" -ForegroundColor $Info
Write-Host ""

# ============================================
# STEP 1: Get GitHub Token if not provided
# ============================================
if ([string]::IsNullOrEmpty($GitHubToken)) {
    Write-Host "STEP 1: GitHub Token Setup" -ForegroundColor $Info
    Write-Host ""
    Write-Host "Get your token from: https://github.com/settings/tokens" -ForegroundColor $Warning
    Write-Host "Scopes needed: repo, admin:repo_hook" -ForegroundColor $Warning
    Write-Host ""
    $GitHubToken = Read-Host "Paste your GitHub Personal Access Token"
    
    if ([string]::IsNullOrEmpty($GitHubToken)) {
        Write-Host "ERROR: No token provided. Exiting." -ForegroundColor $Error
        exit 1
    }
}

Write-Host "✅ Token received" -ForegroundColor $Success
Write-Host ""

# ============================================
# STEP 2: Configure Git
# ============================================
Write-Host "STEP 2: Configuring Git" -ForegroundColor $Info
Write-Host ""

Set-Location $ProjectPath

git config --global user.name $GitHubUser
git config --global user.email "ledeta@github.com"
git config --global credential.helper wincred

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Git configured successfully" -ForegroundColor $Success
} else {
    Write-Host "⚠️  Git configuration returned non-zero exit code" -ForegroundColor $Warning
}

Write-Host ""

# ============================================
# STEP 3: Create Repository via GitHub API
# ============================================
Write-Host "STEP 3: Creating GitHub Repository" -ForegroundColor $Info
Write-Host ""

$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    "name" = $RepoName
    "description" = "ALEM Trading CRM System - Full-stack deployment ready"
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
    
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ Repository created successfully" -ForegroundColor $Success
    } else {
        Write-Host "⚠️  Repository may already exist (Status: $($response.StatusCode))" -ForegroundColor $Warning
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "⚠️  Repository already exists - proceeding with push" -ForegroundColor $Warning
    } else {
        Write-Host "❌ ERROR creating repository:" -ForegroundColor $Error
        Write-Host $_.Exception.Message -ForegroundColor $Error
        exit 1
    }
}

Write-Host ""

# ============================================
# STEP 4: Setup Remote and Push
# ============================================
Write-Host "STEP 4: Pushing Code to GitHub" -ForegroundColor $Info
Write-Host ""

$remoteUrl = "https://${GitHubUser}:${GitHubToken}@github.com/${GitHubUser}/${RepoName}.git"

# Remove old remote if exists
git remote remove origin -ErrorAction SilentlyContinue

# Add new remote
git remote add origin $remoteUrl
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR adding remote" -ForegroundColor $Error
    exit 1
}

Write-Host "Remote added: https://github.com/$GitHubUser/$RepoName.git" -ForegroundColor $Info

# Ensure on main branch
git branch -M main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR setting branch to main" -ForegroundColor $Error
    exit 1
}

Write-Host "Branch set to main" -ForegroundColor $Info

# Push with force
Write-Host "Pushing code (this may take a minute)..." -ForegroundColor $Warning
git push -u origin main --force 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ==========================================" -ForegroundColor $Success
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor $Success
    Write-Host "✅ ==========================================" -ForegroundColor $Success
    Write-Host ""
    Write-Host "Repository URL: https://github.com/$GitHubUser/$RepoName" -ForegroundColor $Success
    Write-Host ""
    Write-Host "What's deployed:" -ForegroundColor $Info
    Write-Host "  ✅ Frontend (Next.js + React)" -ForegroundColor $Success
    Write-Host "  ✅ Backend (NestJS)" -ForegroundColor $Success
    Write-Host "  ✅ Android App" -ForegroundColor $Success
    Write-Host "  ✅ Dockerfiles" -ForegroundColor $Success
    Write-Host "  ✅ render.yaml (deployment config)" -ForegroundColor $Success
    Write-Host "  ✅ Environment setup guides" -ForegroundColor $Success
    Write-Host ""
    Write-Host "Next Steps for Render Deployment:" -ForegroundColor $Info
    Write-Host "  1. Go to: https://render.com" -ForegroundColor $Info
    Write-Host "  2. Connect your GitHub account" -ForegroundColor $Info
    Write-Host "  3. Create new services from repository" -ForegroundColor $Info
    Write-Host "  4. Use render.yaml for configuration" -ForegroundColor $Info
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ ==========================================" -ForegroundColor $Error
    Write-Host "❌ DEPLOYMENT FAILED" -ForegroundColor $Error
    Write-Host "❌ ==========================================" -ForegroundColor $Error
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor $Warning
    Write-Host "  • Check token is valid and not expired" -ForegroundColor $Warning
    Write-Host "  • Verify token has 'repo' and 'admin:repo_hook' scopes" -ForegroundColor $Warning
    Write-Host "  • Check internet connection" -ForegroundColor $Warning
    Write-Host "  • Try again or use GitHub Desktop" -ForegroundColor $Warning
    Write-Host ""
    exit 1
}

# Clean up sensitive data from memory
$GitHubToken = ""

Write-Host "==========================================" -ForegroundColor $Info
Write-Host "End of deployment script" -ForegroundColor $Info
Write-Host "==========================================" -ForegroundColor $Info
