@echo off
echo ========================================================
echo Starting FinTracker (Backend + Frontend)
echo ========================================================

echo 1. Starting Django Backend on http://127.0.0.1:8000/ ...
start "FinTracker Backend" cmd /k "cd /d "%~dp0Fintracker_Backend" && ..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend on http://localhost:5173/ ...
start "FinTracker Frontend" cmd /k "cd /d "%~dp0Fintracker_Frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo 3. Opening browser...
start http://localhost:5173/

echo.
echo FinTracker is running!
echo Backend:  http://127.0.0.1:8000/
echo Frontend: http://localhost:5173/
echo ========================================================

