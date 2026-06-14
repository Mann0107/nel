@echo off
title FashionKart India Launcher
color 0B
echo ======================================================================
echo          FASHIONKART INDIA - AUTOMATED LOCAL SERVER LAUNCHER          
echo ======================================================================
echo.

:: Check for Node.js
echo [1/4] Verifying Node.js environment...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js was not detected on your system.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b
)
echo Node.js is verified.
echo.

:: Backend Setup
echo [2/4] Setting up Backend API and Seeding Database...
cd backend
echo Installing packages (Express, Mongoose, JWT, Razorpay, PDFKit)...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install backend dependencies. Please ensure internet is connected.
    pause
    exit /b
)
echo.
echo Seeding Traditional Collections and Delivery Zones...
node utils/seeder.js
cd ..
echo.

:: Frontend Setup
echo [3/4] Setting up Frontend Next.js Client...
cd frontend
echo Installing packages (Next.js, Tailwind, Lucide Icons)...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b
)
cd ..
echo.

:: Launch servers
echo [4/4] Launching local servers in separate windows...
echo Starting Backend server on http://localhost:5001...
start "FashionKart Backend API" cmd /c "cd backend && npm run dev"

echo Starting Frontend client on http://localhost:3000...
start "FashionKart Frontend Client" cmd /c "cd frontend && npm run dev"

echo.
echo Waiting 5 seconds for Next.js server initialization...
timeout /t 5 >nul

echo Opening browser to http://localhost:3000...
start http://localhost:3000

echo.
echo ======================================================================
echo   FashionKart India is now running!
echo   * Keep the popped-up command prompt windows open to keep servers online.
echo   * You can close this window now.
echo ======================================================================
echo.
pause
