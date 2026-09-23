@echo off
title Access Control Dashboard - Runner
echo ========================================================
echo   Starting Access Control & Attendance Dashboard System
echo ========================================================
echo.

echo [1/2] Starting Backend API Server (Port 5050)...
start "AccessControl Backend (Port 5050)" cmd /k "cd /d %~dp0server && npm run dev"

echo [2/2] Starting Frontend Client App (Port 3000)...
start "AccessControl Frontend (Port 3000)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo   Both services started!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5050
echo ========================================================
echo.
pause
