@echo off
echo =================================================
echo   Starting StudentHub Multi-Service System
echo =================================================

echo [1/3] Launching Auth Service on Port 5001...
start "StudentHub Auth Service (5001)" cmd /k "cd /d auth-service && node src/index.js"

echo [2/3] Launching Student API Service on Port 5002...
start "StudentHub Student API Service (5002)" cmd /k "cd /d student-service && node src/index.js"

echo [3/3] Launching Frontend on Port 3000...
start "StudentHub Frontend (3000)" cmd /k "cd /d frontend && npm run dev"

echo.
echo All services launched!
echo Access the application at: http://localhost:3000
echo =================================================
pause