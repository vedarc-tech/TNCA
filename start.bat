@echo off
chcp 65001 >nul
echo 🚀 Starting TNCA & Cubeskool IQ Challenge Platform...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check completed
echo.

REM Backend setup
echo 📦 Setting up backend...
if not exist "backend" (
    echo ❌ Backend directory not found. Please run this script from the project root.
    pause
    exit /b 1
)

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment.
    pause
    exit /b 1
)

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo SECRET_KEY=tnca-secret-key-2024
        echo JWT_SECRET_KEY=tnca-jwt-secret-2024
        echo MONGO_URI=mongodb://localhost:27017/tnca_iq_platform
    ) > .env
    echo ✅ .env file created
)

echo ✅ Backend setup completed
echo.

REM Frontend setup
echo 📦 Setting up frontend...
cd ..\frontend

REM Install dependencies
echo Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies.
    pause
    exit /b 1
)

echo ✅ Frontend setup completed
echo.

REM Start services
echo 🚀 Starting services...
echo.

REM Start backend in background
echo Starting backend server on http://localhost:5000...
cd ..\backend
call venv\Scripts\activate.bat
start "Backend Server" cmd /k "python server.py"

REM Wait a moment for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend server on http://localhost:5173...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🎉 TNCA IQ Platform is starting up!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:5000
echo.
echo 👤 Super Admin Login:
echo    Email: tamilnaducubeassociation@gmail.com
echo    Password: Tnca@600101
echo.
echo The application will open in your browser shortly...
echo.
echo Press any key to stop all services
pause >nul

REM Stop services
echo 🛑 Stopping services...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ Services stopped
pause 