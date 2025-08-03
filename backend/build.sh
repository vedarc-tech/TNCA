#!/usr/bin/env bash
# Build script for TNCA IQ Platform backend deployment on Render

echo "🚀 Starting TNCA IQ Platform backend build..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs

# Set environment variables if not already set
if [ -z "$SECRET_KEY" ]; then
    echo "⚠️  Warning: SECRET_KEY not set, using default"
fi

if [ -z "$JWT_SECRET_KEY" ]; then
    echo "⚠️  Warning: JWT_SECRET_KEY not set, using default"
fi

if [ -z "$MONGO_URI" ]; then
    echo "❌ Error: MONGO_URI environment variable is required"
    exit 1
fi

echo "✅ Build completed successfully!" 