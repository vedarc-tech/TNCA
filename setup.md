# TNCA & Cubeskool Iqualizer - Setup Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB (local installation or MongoDB Atlas)
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TNCA
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
MONGO_URI=mongodb://localhost:27017/tnca_iq_platform
```

#### Start the Backend Server
```bash
python server.py
```
The backend will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Start the Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## Database Setup

### MongoDB Local Installation
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `tnca_iq_platform`

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGO_URI` in your `.env` file

## Super Admin Access

The system automatically creates a super admin account with these credentials:
- **Email:** tamilnaducubeassociation@gmail.com
- **Username:** TNCA
- **Password:** Tnca@600101

## Features Overview

### For Users
- Interactive IQ quizzes with real-time feedback
- Cube-based interactive games
- Real-time IQ score tracking and improvement graphs
- Leaderboard comparison with peers
- Performance badges (Bronze → Gold Cubist)
- Gamified dashboard with animations
- Mobile-responsive design

### For Admins
- Secure user management (create, edit, delete users)
- Quiz creation and management (text and image support)
- Performance analytics and reporting
- Leaderboard controls
- Content management
- Export functionality (PDF/Excel)

## API Documentation

Complete API documentation is available at `/api/openapi-doc.md`

## Development

### Backend Structure
```
backend/
├── controllers/     # Business logic
├── models/         # Data models
├── routes/         # API routes
├── middleware/     # Authentication & authorization
└── server.py       # Main application
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/ # Reusable components
│   ├── pages/      # Page components
│   ├── services/   # API services
│   ├── contexts/   # React contexts
│   └── App.jsx     # Main application
```

## Deployment

### Backend Deployment
1. Set up a production server
2. Install Python and dependencies
3. Configure environment variables
4. Use a production WSGI server (Gunicorn)
5. Set up reverse proxy (Nginx)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure your web server to serve the React app

## Support

For technical support or questions, contact:
- Email: tamilnaducubeassociation@gmail.com
- Phone: +91 600 101 0000

## License

This project is developed for Tamil Nadu Cube Association & Cubeskool. 