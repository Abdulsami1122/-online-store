@echo off
echo ========================================================
echo   Stopping Docker Containers...
echo ========================================================

docker-compose down

echo.
echo Containers stopped. Ports 3000 and 5000 are now FREE!
echo.
pause

