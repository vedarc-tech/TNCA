# WSGI entry point for TNCA Backend
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the Flask app from backend
from wsgi import app

if __name__ == "__main__":
    app.run() 