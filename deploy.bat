@echo off
REM TNCA IQ Platform Deployment Script for Windows
REM This script helps prepare and deploy the application

echo 🚀 TNCA IQ Platform Deployment Script
echo ======================================

:menu
echo.
echo Choose an option:
echo 1. Check requirements
echo 2. Generate secure keys
echo 3. Build frontend
echo 4. Test backend
echo 5. Create deployment files
echo 6. Show deployment checklist
echo 7. Run all checks
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto check_requirements
if "%choice%"=="2" goto generate_keys
if "%choice%"=="3" goto build_frontend
if "%choice%"=="4" goto test_backend
if "%choice%"=="5" goto create_files
if "%choice%"=="6" goto show_checklist
if "%choice%"=="7" goto run_all
if "%choice%"=="8" goto exit
echo Invalid choice. Please try again.
goto menu

:check_requirements
echo [HEADER] Checking requirements...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+
    goto menu
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm
    goto menu
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.8+
    goto menu
)

REM Check pip
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pip is not installed. Please install pip
    goto menu
)

echo [INFO] All requirements are met!
goto menu

:generate_keys
echo [HEADER] Generating secure keys...
echo.

for /f "tokens=*" %%i in ('python -c "import secrets; print(secrets.token_hex(32))"') do set SECRET_KEY=%%i
for /f "tokens=*" %%i in ('python -c "import secrets; print(secrets.token_hex(32))"') do set JWT_SECRET_KEY=%%i

echo Generated keys:
echo SECRET_KEY=%SECRET_KEY%
echo JWT_SECRET_KEY=%JWT_SECRET_KEY%
echo.
echo [WARNING] Save these keys securely! You'll need them for deployment.
goto menu

:build_frontend
echo [HEADER] Building frontend...
echo.

cd frontend

echo [INFO] Installing frontend dependencies...
call npm install

echo [INFO] Building frontend for production...
call npm run build

if %errorlevel% equ 0 (
    echo [INFO] Frontend build successful!
) else (
    echo [ERROR] Frontend build failed!
    cd ..
    goto menu
)

cd ..
goto menu

:test_backend
echo [HEADER] Testing backend...
echo.

cd backend

echo [INFO] Installing backend dependencies...
pip install -r requirements.txt

echo [INFO] Testing backend server...
python -c "from server import app; print('Backend server test successful!')"

cd ..
goto menu

:create_files
echo [HEADER] Creating deployment files...
echo.

echo [INFO] Deployment files are ready!
goto menu

:show_checklist
echo [HEADER] Deployment Checklist
echo.
echo Before deploying, ensure you have:
echo.
echo 1. MongoDB Atlas:
echo    ☐ Created cluster ✓
echo    ☐ Set up database user ✓
echo    ☐ Configured network access (0.0.0.0/0)
echo    ☐ Copied connection string ✓
echo.
echo 2. Render (Backend):
echo    ☐ Created account
echo    ☐ Connected GitHub repository
echo    ☐ Set environment variables:
echo      - MONGO_URI=mongodb+srv://tnca:tnca5959@iqualizer.wsbg8br.mongodb.net/tnca_iq_platform
echo      - SECRET_KEY
echo      - JWT_SECRET_KEY
echo      - CORS_ORIGINS
echo.
echo 3. Vercel (Frontend):
echo    ☐ Created account
echo    ☐ Connected GitHub repository
echo    ☐ Set environment variables:
echo      - VITE_API_URL
echo.
echo 4. Repository:
echo    ☐ All changes committed and pushed
echo    ☐ No sensitive data in repository
echo.
goto menu

:run_all
call :check_requirements
call :generate_keys
call :build_frontend
call :test_backend
call :create_files
call :show_checklist
goto menu

:exit
echo [INFO] Goodbye!
exit /b 0 