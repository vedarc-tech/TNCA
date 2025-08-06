@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 🚀 TNCA & Cubeskool Iqualizer - Production Deployment Script (Windows)
REM This script prepares your project for deployment to Vercel (Frontend) and Render (Backend)

echo.
echo 🎯 TNCA ^& Cubeskool Iqualizer - Production Deployment Preparation
echo ==================================================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

echo ✅ All required tools are installed

REM Check if we're in the project root
if not exist "README.md" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)
if not exist "frontend" (
    echo ❌ Frontend directory not found
    pause
    exit /b 1
)
if not exist "backend" (
    echo ❌ Backend directory not found
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Step 1: Backend Preparation
echo.
echo ℹ️  Step 1: Preparing Backend for Render Deployment
echo ----------------------------------------------------

cd backend

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found in backend directory
    pause
    exit /b 1
)

REM Check if all required backend files exist
set "missing_files="
if not exist "server.py" set "missing_files=!missing_files! server.py"
if not exist "wsgi.py" set "missing_files=!missing_files! wsgi.py"
if not exist "gunicorn_config.py" set "missing_files=!missing_files! gunicorn_config.py"
if not exist "render.yaml" set "missing_files=!missing_files! render.yaml"
if not exist "runtime.txt" set "missing_files=!missing_files! runtime.txt"
if not exist "Procfile" set "missing_files=!missing_files! Procfile"

if not "!missing_files!"=="" (
    echo ❌ Required files missing: !missing_files!
    pause
    exit /b 1
)

echo ✅ All backend deployment files present

REM Test Python compilation
echo ℹ️  Testing Python compilation...
python -m py_compile server.py >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend Python compilation failed
    pause
    exit /b 1
) else (
    echo ✅ Backend Python compilation successful
)

REM Test critical imports
echo ℹ️  Testing critical imports...
python -c "import flask, pymongo, flask_jwt_extended, flask_cors; print('✅ All imports successful')" >nul 2>&1
if errorlevel 1 (
    echo ❌ Some backend dependencies are missing
    pause
    exit /b 1
) else (
    echo ✅ All backend dependencies available
)

cd ..

REM Step 2: Frontend Preparation
echo.
echo ℹ️  Step 2: Preparing Frontend for Vercel Deployment
echo -----------------------------------------------------

cd frontend

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found in frontend directory
    pause
    exit /b 1
)

REM Check if all required frontend files exist
set "missing_files="
if not exist "vite.config.js" set "missing_files=!missing_files! vite.config.js"
if not exist "vercel.json" set "missing_files=!missing_files! vercel.json"
if not exist "index.html" set "missing_files=!missing_files! index.html"

if not "!missing_files!"=="" (
    echo ❌ Required files missing: !missing_files!
    pause
    exit /b 1
)

echo ✅ All frontend deployment files present

REM Install dependencies
echo ℹ️  Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed
)

REM Test build
echo ℹ️  Testing frontend build...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
) else (
    echo ✅ Frontend build successful
)

REM Check if dist directory was created
if not exist "dist" (
    echo ❌ Build output directory 'dist' not found
    pause
    exit /b 1
)

echo ✅ Frontend build output verified

cd ..

REM Step 3: Git Status Check
echo.
echo ℹ️  Step 3: Checking Git Status
echo --------------------------------

REM Check if git repository exists
if not exist ".git" (
    echo ⚠️  Git repository not found. Initializing...
    git init
    git add .
    git commit -m "Initial commit - TNCA & Cubeskool Iqualizer"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository found
)

REM Check for uncommitted changes
git status --porcelain >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  Uncommitted changes detected
    echo Files with changes:
    git status --porcelain
    echo.
    set /p "commit_changes=Do you want to commit these changes? (y/n): "
    if /i "!commit_changes!"=="y" (
        git add .
        git commit -m "Prepare for production deployment - %date% %time%"
        echo ✅ Changes committed
    ) else (
        echo ⚠️  Please commit your changes before deployment
    )
) else (
    echo ✅ No uncommitted changes
)

REM Step 4: Deployment Instructions
echo.
echo ℹ️  Step 4: Deployment Instructions
echo ===================================
echo.
echo ✅ 🎉 Your project is ready for deployment!
echo.
echo 📋 NEXT STEPS:
echo ==============
echo.
echo 1. 🔧 BACKEND DEPLOYMENT (RENDER):
echo    • Go to https://render.com
echo    • Create new Web Service
echo    • Connect your GitHub repository
echo    • Use these settings:
echo      - Build Command: pip install -r requirements.txt
echo      - Start Command: gunicorn --config gunicorn_config.py wsgi:app
echo    • Add environment variables (see DEPLOYMENT_GUIDE_VERCEL_RENDER.md)
echo.
echo 2. 🎨 FRONTEND DEPLOYMENT (VERCEL):
echo    • Go to https://vercel.com
echo    • Create new project
echo    • Import your GitHub repository
echo    • Set root directory to 'frontend'
echo    • Add environment variables (see DEPLOYMENT_GUIDE_VERCEL_RENDER.md)
echo.
echo 3. 🔗 CONNECT THEM:
echo    • Update CORS_ORIGINS in Render with your Vercel domain
echo    • Update VITE_API_URL in Vercel with your Render backend URL
echo.
echo 📖 For detailed instructions, see: DEPLOYMENT_GUIDE_VERCEL_RENDER.md
echo.

echo ✅ Deployment preparation completed successfully!
echo ℹ️  Your project is now ready to be deployed to Vercel and Render!

pause 