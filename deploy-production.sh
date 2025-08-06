#!/bin/bash

# 🚀 TNCA & Cubeskool Iqualizer - Production Deployment Script
# This script prepares your project for deployment to Vercel (Frontend) and Render (Backend)

echo "🎯 TNCA & Cubeskool Iqualizer - Production Deployment Preparation"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

print_status "All required tools are installed"

# Check if we're in the project root
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Project structure verified"

# Step 1: Backend Preparation
echo ""
print_info "Step 1: Preparing Backend for Render Deployment"
echo "----------------------------------------------------"

cd backend

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found in backend directory"
    exit 1
fi

# Check if all required backend files exist
required_backend_files=("server.py" "wsgi.py" "gunicorn_config.py" "render.yaml" "runtime.txt" "Procfile")
for file in "${required_backend_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found in backend directory"
        exit 1
    fi
done

print_status "All backend deployment files present"

# Test Python compilation
print_info "Testing Python compilation..."
if python3 -m py_compile server.py; then
    print_status "Backend Python compilation successful"
else
    print_error "Backend Python compilation failed"
    exit 1
fi

# Test critical imports
print_info "Testing critical imports..."
if python3 -c "import flask, pymongo, flask_jwt_extended, flask_cors; print('✅ All imports successful')" 2>/dev/null; then
    print_status "All backend dependencies available"
else
    print_error "Some backend dependencies are missing"
    exit 1
fi

cd ..

# Step 2: Frontend Preparation
echo ""
print_info "Step 2: Preparing Frontend for Vercel Deployment"
echo "-----------------------------------------------------"

cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend directory"
    exit 1
fi

# Check if all required frontend files exist
required_frontend_files=("vite.config.js" "vercel.json" "index.html")
for file in "${required_frontend_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found in frontend directory"
        exit 1
    fi
done

print_status "All frontend deployment files present"

# Install dependencies
print_info "Installing frontend dependencies..."
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Test build
print_info "Testing frontend build..."
if npm run build; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    print_error "Build output directory 'dist' not found"
    exit 1
fi

print_status "Frontend build output verified"

cd ..

# Step 3: Git Status Check
echo ""
print_info "Step 3: Checking Git Status"
echo "--------------------------------"

# Check if git repository exists
if [ ! -d ".git" ]; then
    print_warning "Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - TNCA & Cubeskool Iqualizer"
    print_status "Git repository initialized"
else
    print_status "Git repository found"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected"
    echo "Files with changes:"
    git status --porcelain
    echo ""
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Prepare for production deployment - $(date)"
        print_status "Changes committed"
    else
        print_warning "Please commit your changes before deployment"
    fi
else
    print_status "No uncommitted changes"
fi

# Step 4: Deployment Instructions
echo ""
print_info "Step 4: Deployment Instructions"
echo "===================================="

echo ""
print_status "🎉 Your project is ready for deployment!"
echo ""

echo "📋 NEXT STEPS:"
echo "=============="
echo ""
echo "1. 🔧 BACKEND DEPLOYMENT (RENDER):"
echo "   • Go to https://render.com"
echo "   • Create new Web Service"
echo "   • Connect your GitHub repository"
echo "   • Use these settings:"
echo "     - Build Command: pip install -r requirements.txt"
echo "     - Start Command: gunicorn --config gunicorn_config.py wsgi:app"
echo "   • Add environment variables (see DEPLOYMENT_GUIDE_VERCEL_RENDER.md)"
echo ""
echo "2. 🎨 FRONTEND DEPLOYMENT (VERCEL):"
echo "   • Go to https://vercel.com"
echo "   • Create new project"
echo "   • Import your GitHub repository"
echo "   • Set root directory to 'frontend'"
echo "   • Add environment variables (see DEPLOYMENT_GUIDE_VERCEL_RENDER.md)"
echo ""
echo "3. 🔗 CONNECT THEM:"
echo "   • Update CORS_ORIGINS in Render with your Vercel domain"
echo "   • Update VITE_API_URL in Vercel with your Render backend URL"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE_VERCEL_RENDER.md"
echo ""

print_status "Deployment preparation completed successfully!"
print_info "Your project is now ready to be deployed to Vercel and Render!" 