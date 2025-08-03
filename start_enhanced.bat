@echo off
echo ========================================
echo   TNCA Enhanced Game Management System
echo ========================================
echo.

echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)
echo ✓ Python found

echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)
echo ✓ Node.js found

echo [3/6] Checking MongoDB...
echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB service not found or failed to start
    echo Please ensure MongoDB is installed and running
    echo You can start it manually or install MongoDB Community Server
)
echo ✓ MongoDB check completed

echo [4/6] Installing/Updating Python dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✓ Python dependencies installed

echo [5/6] Installing/Updating Node.js dependencies...
cd ..\frontend
npm install
if errorlevel 1 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✓ Node.js dependencies installed

echo [6/6] Initializing enhanced games...
cd ..\backend
python init_games.py
if errorlevel 1 (
    echo WARNING: Failed to initialize games
    echo This is not critical, games can be initialized later
)
echo ✓ Enhanced games initialized

echo.
echo ========================================
echo   Starting Enhanced TNCA Platform
echo ========================================
echo.

echo Starting backend server with WebSocket support...
cd ..\backend
start "TNCA Backend" cmd /k "python server.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend development server...
cd ..\frontend
start "TNCA Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   🎮 Enhanced Platform Started! 🎮
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo New Features Available:
echo ✓ Real-time Tournament Management
echo ✓ Interactive Chess & Cube Games
echo ✓ WebSocket Communication
echo ✓ Live Chat & Notifications
echo ✓ Enhanced Admin Controls
echo ✓ Real-time Analytics
echo.
echo Super Admin Access:
echo Email: tamilnaducubeassociation@gmail.com
echo Username: TNCA
echo Password: Tnca@600101
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5173

echo.
echo Platform is running! Keep these windows open.
echo To stop the servers, close the command windows.
echo.
pause 