@echo off
echo ========================================================
echo   Starting Online Store with Docker Compose
echo ========================================================

:: Check if port 5000 or 3000 is occupied by a lingering process
powershell -NoProfile -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue" >nul 2>&1
powershell -NoProfile -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue" >nul 2>&1

echo Starting Docker containers in background...
docker-compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Docker. Make sure Docker Desktop is open and running!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   [SUCCESS] Containers are UP and RUNNING!
echo   Storefront & Admin:  http://localhost:3000
echo   Admin Direct Login:  http://localhost:3000/admin/login
echo   Backend API:         http://localhost:5000/api
echo ========================================================
echo.
pause

