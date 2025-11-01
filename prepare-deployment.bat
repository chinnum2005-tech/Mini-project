@echo off
echo 🚀 BlockLearn Deployment Preparation Script
echo ===========================================
echo.
echo This script will prepare your BlockLearn project for deployment.
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo 🏗️ Building the project...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build the project
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo 📝 Running deployment preparation script...
node prepare-deployment.js

echo.
echo 🎉 Deployment preparation completed!
echo Check DEPLOYMENT_INSTRUCTIONS.md for next steps.
echo.
pause