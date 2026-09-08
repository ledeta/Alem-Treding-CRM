@echo off
REM ============================================
REM AGGRESSIVE GITHUB DEPLOYMENT SCRIPT
REM ============================================
REM This script creates the repository and pushes all code to GitHub

setlocal enabledelayedexpansion

REM Configuration
set GITHUB_USER=ledeta
set REPO_NAME=Alem-Tredint
set PROJECT_PATH=C:\Users\Milion's\Desktop\Alem-Treding-main

REM ============================================
REM STEP 1: Get GitHub Token
REM ============================================
echo.
echo ========================================
echo STEP 1: GitHub Token Setup
echo ========================================
echo.
echo You need a GitHub Personal Access Token to deploy.
echo.
echo 1. Go to: https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Name: AlemTredintDeploy
echo 4. Check scopes: repo, admin:repo_hook
echo 5. Generate and copy the token
echo.
set /p GITHUB_TOKEN="Paste your GitHub Personal Access Token here: "

if "%GITHUB_TOKEN%"=="" (
    echo ERROR: No token provided. Exiting.
    exit /b 1
)

REM ============================================
REM STEP 2: Configure Git
REM ============================================
echo.
echo ========================================
echo STEP 2: Configuring Git
echo ========================================
echo.

cd /d "%PROJECT_PATH%"

git config --global user.name "%GITHUB_USER%"
git config --global user.email "ledeta@github.com"
git config --global credential.helper wincred

echo ✅ Git configured

REM ============================================
REM STEP 3: Create Repository (via GitHub API)
REM ============================================
echo.
echo ========================================
echo STEP 3: Creating GitHub Repository
echo ========================================
echo.

powershell -Command ^
  "$headers = @{Authorization='token %GITHUB_TOKEN%'; Accept='application/vnd.github.v3+json'}; " ^
  "$body = @{name='%REPO_NAME%'; description='ALEM Trading CRM System'; private=$false; auto_init=$false} | ConvertTo-Json; " ^
  "try { $response = Invoke-WebRequest -Uri 'https://api.github.com/user/repos' -Method POST -Headers $headers -Body $body -ContentType 'application/json'; Write-Host 'Repository created or already exists'; } catch { Write-Host 'Repository may already exist'; }"

echo.

REM ============================================
REM STEP 4: Push Code to GitHub
REM ============================================
echo.
echo ========================================
echo STEP 4: Pushing Code to GitHub
echo ========================================
echo.

git remote remove origin 2>nul
git remote add origin "https://%GITHUB_USER%:%GITHUB_TOKEN%@github.com/%GITHUB_USER%/%REPO_NAME%.git"
git branch -M main
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ========================================
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo ✅ ========================================
    echo.
    echo Repository: https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo.
    echo Next Steps:
    echo 1. Go to Render: https://render.com
    echo 2. Connect GitHub repository
    echo 3. Deploy services using render.yaml
    echo 4. Use environment variables from deployment guides
    echo.
) else (
    echo.
    echo ❌ DEPLOYMENT FAILED
    echo ❌ Check the error messages above
    echo.
)

REM Clean up token from memory
set GITHUB_TOKEN=

pause
