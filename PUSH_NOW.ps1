# ============================================
# PUSH TO GITHUB - FINAL SOLUTION
# ============================================
# Repository now exists - just needs authentication

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PUSH TO GITHUB - FINAL SOLUTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Go to project
cd "C:\Users\Milion's\Desktop\Alem-Treding-main"

Write-Host "Step 1: You have 3 options to authenticate..." -ForegroundColor Yellow
Write-Host ""
Write-Host "OPTION A: GitHub CLI (Easiest if you can authorize browser)" -ForegroundColor Cyan
Write-Host "  Command: gh auth login --web" -ForegroundColor Cyan
Write-Host "  Then: Run this script again" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION B: Personal Access Token (Recommended)" -ForegroundColor Cyan
Write-Host "  1. Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "  2. Generate new token (classic)" -ForegroundColor Cyan
Write-Host "  3. Scope: repo" -ForegroundColor Cyan
Write-Host "  4. Copy token" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION C: SSH Key (If you have SSH configured)" -ForegroundColor Cyan
Write-Host "  Already configured for GitHub SSH" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Select option (A, B, or C)"

switch ($choice.ToUpper()) {
    "A" {
        Write-Host ""
        Write-Host "Attempting GitHub CLI authentication..." -ForegroundColor Yellow
        gh auth login --web
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Authenticated!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Now pushing code..." -ForegroundColor Cyan
            
            git remote remove origin -ErrorAction SilentlyContinue
            git remote add origin https://github.com/ledeta/Alem-Tredint.git
            git branch -M main
            git push -u origin main --force
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ PUSH SUCCESSFUL!" -ForegroundColor Green
                Write-Host "Repository: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ Authentication failed" -ForegroundColor Red
        }
    }
    
    "B" {
        Write-Host ""
        $token = Read-Host "Paste your GitHub Personal Access Token"
        
        if ([string]::IsNullOrEmpty($token)) {
            Write-Host "❌ No token provided" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Pushing code with token..." -ForegroundColor Yellow
        Write-Host ""
        
        git remote remove origin -ErrorAction SilentlyContinue
        git remote add origin "https://ledeta:$token@github.com/ledeta/Alem-Tredint.git"
        git branch -M main
        git push -u origin main --force 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ ========================================" -ForegroundColor Green
            Write-Host "✅ PUSH SUCCESSFUL!" -ForegroundColor Green
            Write-Host "✅ ========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Repository: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next Steps:" -ForegroundColor Cyan
            Write-Host "1. Verify: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Cyan
            Write-Host "2. Go to: https://render.com" -ForegroundColor Cyan
            Write-Host "3. Deploy using QUICK_DEPLOY_STEPS.txt" -ForegroundColor Cyan
        } else {
            Write-Host ""
            Write-Host "❌ PUSH FAILED" -ForegroundColor Red
            Write-Host "Check token validity and try again" -ForegroundColor Red
        }
        
        $token = ""
    }
    
    "C" {
        Write-Host ""
        Write-Host "Using SSH authentication..." -ForegroundColor Yellow
        Write-Host ""
        
        git remote remove origin -ErrorAction SilentlyContinue
        git remote add origin "git@github.com:ledeta/Alem-Tredint.git"
        git branch -M main
        git push -u origin main --force 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ ========================================" -ForegroundColor Green
            Write-Host "✅ PUSH SUCCESSFUL!" -ForegroundColor Green
            Write-Host "✅ ========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Repository: https://github.com/ledeta/Alem-Tredint" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ SSH authentication failed" -ForegroundColor Red
            Write-Host "Configure SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "End of script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
