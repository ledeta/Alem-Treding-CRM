# ============================================================================
# Push to GitHub Script
# ============================================================================
# This script helps you update your GitHub credentials and push changes
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Push to GitHub - Alem Trading CRM" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Your GitHub token has expired. Let's update it!`n" -ForegroundColor Yellow

Write-Host "Step 1: Generate a new GitHub Personal Access Token" -ForegroundColor Green
Write-Host "   1. Go to: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "   2. Click 'Generate new token' > 'Classic'" -ForegroundColor White
Write-Host "   3. Name: 'Alem CRM Deploy'" -ForegroundColor White
Write-Host "   4. Select scope: 'repo' (Full control of private repositories)" -ForegroundColor White
Write-Host "   5. Click 'Generate token' at the bottom" -ForegroundColor White
Write-Host "   6. Copy the token (starts with 'ghp_')`n" -ForegroundColor White

$token = Read-Host "Paste your new GitHub token here"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "`nError: No token provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "`nUpdating Git remote URL with new token..." -ForegroundColor Yellow
git remote set-url origin "https://ledeta:$token@github.com/ledeta/Alem-Treding-CRM.git"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Remote URL updated successfully!`n" -ForegroundColor Green
    
    Write-Host "Pushing changes to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "  ✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        Write-Host "Your changes are now on GitHub!" -ForegroundColor Cyan
        Write-Host "Repository: https://github.com/ledeta/Alem-Treding-CRM`n" -ForegroundColor Cyan
        
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Go to Render Dashboard: https://dashboard.render.com" -ForegroundColor White
        Write-Host "2. Your services will auto-deploy the new changes" -ForegroundColor White
        Write-Host "3. Wait 5-10 minutes for deployment to complete" -ForegroundColor White
        Write-Host "4. Test the fix on your deployed frontend URL`n" -ForegroundColor White
        
    } else {
        Write-Host "`nError: Failed to push to GitHub." -ForegroundColor Red
        Write-Host "Please check your internet connection and try again." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nError: Failed to update remote URL." -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
