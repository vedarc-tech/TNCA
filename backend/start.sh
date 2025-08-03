#!/usr/bin/env bash
# Start script for TNCA IQ Platform backend deployment on Render

echo "🚀 Starting TNCA IQ Platform backend..."

# Run the application with Gunicorn
exec gunicorn --config gunicorn_config.py wsgi:app 