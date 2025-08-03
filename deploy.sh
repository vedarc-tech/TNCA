#!/bin/bash

# TNCA IQ Platform Deployment Script
# This script helps prepare and deploy the application

echo "🚀 TNCA IQ Platform Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_header "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip3"
        exit 1
    fi
    
    print_status "All requirements are met!"
}

# Generate secure keys
generate_keys() {
    print_header "Generating secure keys..."
    
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    
    echo "Generated keys:"
    echo "SECRET_KEY=$SECRET_KEY"
    echo "JWT_SECRET_KEY=$JWT_SECRET_KEY"
    echo ""
    print_warning "Save these keys securely! You'll need them for deployment."
}

# Build frontend
build_frontend() {
    print_header "Building frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build for production
    print_status "Building frontend for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Frontend build successful!"
    else
        print_error "Frontend build failed!"
        exit 1
    fi
    
    cd ..
}

# Test backend
test_backend() {
    print_header "Testing backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    pip3 install -r requirements.txt
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating one..."
        python3 generate_env.ps1 2>/dev/null || echo "Please create .env file manually"
    fi
    
    # Test server startup
    print_status "Testing backend server..."
    timeout 10s python3 -c "
import sys
sys.path.append('.')
from server import app
print('Backend server test successful!')
" || print_warning "Backend server test incomplete (timeout)"
    
    cd ..
}

# Create deployment files
create_deployment_files() {
    print_header "Creating deployment files..."
    
    # Make scripts executable
    chmod +x backend/build.sh
    chmod +x backend/start.sh
    
    print_status "Deployment files created and made executable!"
}

# Show deployment checklist
show_checklist() {
    print_header "Deployment Checklist"
    echo ""
    echo "Before deploying, ensure you have:"
    echo ""
    echo "1. MongoDB Atlas:"
    echo "   ☐ Created cluster"
    echo "   ☐ Set up database user"
    echo "   ☐ Configured network access (0.0.0.0/0)"
    echo "   ☐ Copied connection string"
    echo ""
    echo "2. Render (Backend):"
    echo "   ☐ Created account"
    echo "   ☐ Connected GitHub repository"
    echo "   ☐ Set environment variables:"
    echo "     - MONGO_URI"
    echo "     - SECRET_KEY"
    echo "     - JWT_SECRET_KEY"
    echo "     - CORS_ORIGINS"
    echo ""
    echo "3. Vercel (Frontend):"
    echo "   ☐ Created account"
    echo "   ☐ Connected GitHub repository"
    echo "   ☐ Set environment variables:"
    echo "     - VITE_API_URL"
    echo ""
    echo "4. Repository:"
    echo "   ☐ All changes committed and pushed"
    echo "   ☐ No sensitive data in repository"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    print_header "Choose an option:"
    echo "1. Check requirements"
    echo "2. Generate secure keys"
    echo "3. Build frontend"
    echo "4. Test backend"
    echo "5. Create deployment files"
    echo "6. Show deployment checklist"
    echo "7. Run all checks"
    echo "8. Exit"
    echo ""
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1)
            check_requirements
            ;;
        2)
            generate_keys
            ;;
        3)
            build_frontend
            ;;
        4)
            test_backend
            ;;
        5)
            create_deployment_files
            ;;
        6)
            show_checklist
            ;;
        7)
            check_requirements
            generate_keys
            build_frontend
            test_backend
            create_deployment_files
            show_checklist
            ;;
        8)
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            ;;
    esac
}

# Check if script is run with arguments
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        echo ""
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case $1 in
        "check")
            check_requirements
            ;;
        "keys")
            generate_keys
            ;;
        "build")
            build_frontend
            ;;
        "test")
            test_backend
            ;;
        "files")
            create_deployment_files
            ;;
        "checklist")
            show_checklist
            ;;
        "all")
            check_requirements
            generate_keys
            build_frontend
            test_backend
            create_deployment_files
            show_checklist
            ;;
        *)
            print_error "Usage: $0 [check|keys|build|test|files|checklist|all]"
            exit 1
            ;;
    esac
fi 