from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os
from dotenv import load_dotenv
from datetime import datetime

# Import WebSocket service
from websocket_service import socketio

# Import routes
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.user_routes import user_bp
from routes.quiz_routes import quiz_bp
from routes.game_routes import game_bp
from routes.analytics_routes import analytics_bp
from routes.content_routes import content_bp
from routes.tournament_routes import tournament_bp
from routes.developer_routes import developer_bp
from routes.maintenance_routes import maintenance_bp

# Import database initialization
from models.database import init_db

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', '905f1aaad4614cd226345cbc6f91cbb3f857bd18aa4d7234a9928897e2339d7f')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'b8b96813b60e117594c1a8d2deb3fc791b74b7f7bfc937ccbb0a0ac37a1dfea0')

# JWT Configuration - Use environment variables
access_token_expires = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # Default 1 hour
refresh_token_expires = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 604800))  # Default 7 days

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(seconds=access_token_expires)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(seconds=refresh_token_expires)

# MongoDB Configuration
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/tnca_iq_platform')

# Initialize extensions
# CORS configuration for production
allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:5174').split(',')
CORS(app, origins=allowed_origins)
jwt = JWTManager(app)
socketio.init_app(app)

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
app.register_blueprint(game_bp, url_prefix='/api/game')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(tournament_bp, url_prefix='/api/tournament')
app.register_blueprint(developer_bp, url_prefix='/api/developer')
app.register_blueprint(maintenance_bp, url_prefix='/api/maintenance')

@app.route('/')
def home():
    return jsonify({
        "message": "TNCA & Cubeskool Iqualizer API",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, debug=debug_mode, host='0.0.0.0', port=port) 