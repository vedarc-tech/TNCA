# TNCA IQ Platform - Environment File Generator
# This script generates a secure .env file with proper secret keys

Write-Host "🔐 Generating secure .env file for TNCA IQ Platform..." -ForegroundColor Green

# Generate secure secret keys
$secretKey = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$jwtSecretKey = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Create .env content
$envContent = @"
# TNCA IQ Platform Environment Variables
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Flask Secret Key (for session management)
SECRET_KEY=$secretKey

# JWT Secret Key (for authentication tokens)
JWT_SECRET_KEY=$jwtSecretKey

# MongoDB Connection URI
MONGO_URI=mongodb://localhost:27017/tnca_iq_platform

# Flask Environment
FLASK_ENV=development
FLASK_DEBUG=True

# CORS Settings
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT Settings
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800

# File Upload Settings
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=uploads

# Super Admin Credentials (CHANGE THESE FOR PRODUCTION!)
SUPER_ADMIN_EMAIL=tamilnaducubeassociation@gmail.com
SUPER_ADMIN_USERNAME=TNCA
SUPER_ADMIN_PASSWORD=Tnca@600101
SUPER_ADMIN_NAME=TNCA Super Admin

# Email Settings (optional - for future features)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Redis Settings (optional - for caching)
REDIS_URL=redis://localhost:6379

# Logging Level
LOG_LEVEL=INFO
"@

# Write to .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host "📁 Location: $(Get-Location)\.env" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Generated Secret Keys:" -ForegroundColor Yellow
Write-Host "SECRET_KEY: $secretKey" -ForegroundColor Gray
Write-Host "JWT_SECRET_KEY: $jwtSecretKey" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "1. Keep this .env file secure and never commit it to version control" -ForegroundColor Yellow
Write-Host "2. Change the SUPER_ADMIN credentials for production use" -ForegroundColor Yellow
Write-Host "3. Make sure MongoDB is running on your system" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 You can now start the backend server with: python server.py" -ForegroundColor Green 