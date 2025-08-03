#!/bin/bash

echo "========================================"
echo "  TNCA Enhanced Game Management System"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo "[1/6] Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    print_error "Python is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi
print_status "Python found ($($PYTHON_CMD --version))"

echo "[2/6] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ and try again"
    exit 1
fi
print_status "Node.js found ($(node --version))"

echo "[3/6] Checking MongoDB..."
if command -v mongod &> /dev/null; then
    # Try to start MongoDB if not running
    if ! pgrep -x "mongod" > /dev/null; then
        print_info "Starting MongoDB..."
        mongod --fork --logpath /tmp/mongod.log --dbpath /tmp/mongodb
        if [ $? -eq 0 ]; then
            print_status "MongoDB started"
        else
            print_warning "Failed to start MongoDB automatically"
            echo "Please ensure MongoDB is running manually"
        fi
    else
        print_status "MongoDB is already running"
    fi
else
    print_warning "MongoDB not found"
    echo "Please install MongoDB Community Server"
fi

echo "[4/6] Installing/Updating Python dependencies..."
cd backend
if ! $PYTHON_CMD -m pip install -r requirements.txt; then
    print_error "Failed to install Python dependencies"
    exit 1
fi
print_status "Python dependencies installed"

echo "[5/6] Installing/Updating Node.js dependencies..."
cd ../frontend
if ! npm install; then
    print_error "Failed to install Node.js dependencies"
    exit 1
fi
print_status "Node.js dependencies installed"

echo "[6/6] Initializing enhanced games..."
cd ../backend
if ! $PYTHON_CMD init_games.py; then
    print_warning "Failed to initialize games"
    echo "This is not critical, games can be initialized later"
else
    print_status "Enhanced games initialized"
fi

echo
echo "========================================"
echo "  Starting Enhanced TNCA Platform"
echo "========================================"
echo

# Function to cleanup background processes
cleanup() {
    echo
    print_info "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "Starting backend server with WebSocket support..."
cd ../backend
$PYTHON_CMD server.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "========================================"
echo "  🎮 Enhanced Platform Started! 🎮"
echo "========================================"
echo
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "New Features Available:"
echo "✓ Real-time Tournament Management"
echo "✓ Interactive Chess & Cube Games"
echo "✓ WebSocket Communication"
echo "✓ Live Chat & Notifications"
echo "✓ Enhanced Admin Controls"
echo "✓ Real-time Analytics"
echo
echo "Super Admin Access:"
echo "Email: tamilnaducubeassociation@gmail.com"
echo "Username: TNCA"
echo "Password: Tnca@600101"
echo

# Open browser if possible
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:5173 &
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:5173 &
fi

echo "Platform is running! Press Ctrl+C to stop servers."
echo

# Wait for background processes
wait 