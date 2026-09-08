@echo off
cd /d "c:\Users\Milion's\Desktop\Alem Trading\alem-crm-system"

REM Configure git
git config --global user.email "miliyee@gmail.com"
git config --global user.name "Miliyee"
git config core.safecrlf false
git config core.autocrlf false

REM Add all files
echo Adding files...
git add .
echo.

REM Commit
echo Committing...
git commit -m "ALEM CRM System - Production Ready v1.0"
echo.

REM Set main branch
git branch -M main
echo.

REM Add remote if not exists
git remote remove origin 2>nul
git remote add origin https://github.com/miliyee/Alem-Treding.git
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main --force
echo.

echo Done! Check https://github.com/miliyee/Alem-Treding for your code
pause
