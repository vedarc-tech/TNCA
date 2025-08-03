@echo off
echo 🔐 Setting up environment for TNCA IQ Platform...
echo.

REM Run the PowerShell script to generate .env
powershell -ExecutionPolicy Bypass -File "generate_env.ps1"

echo.
echo ✅ Environment setup completed!
echo.
pause 