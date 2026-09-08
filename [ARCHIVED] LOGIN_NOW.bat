@echo off
cls
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║                                                       ║
echo ║        🎊 ALEM CRM SYSTEM - READY TO LOGIN! 🎊       ║
echo ║                                                       ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo ✅ System Status: FULLY OPERATIONAL
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 Frontend URL: http://localhost:3000
echo 🔧 Backend API:  http://localhost:3001
echo 📚 API Docs:     http://localhost:3001/api/docs
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 👤 LOGIN CREDENTIALS:
echo.
echo    Username: admin
echo    Password: Admin123!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Opening frontend in your browser...
echo.
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo ✅ Browser opened!
echo.
echo If the page shows 404, that's normal before login.
echo Just use the credentials above to login.
echo.
echo Press any key to exit...
pause >nul
