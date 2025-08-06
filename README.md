# TNCA & Cubeskool Iqualizer

A comprehensive IQ testing and gaming platform with real-time analytics, user management, and interactive features.

## 🚀 Quick Deploy

### Backend (Render)
1. Deploy to [Render.com](https://render.com)
2. Use build command: `pip install -r requirements.txt`
3. Use start command: `gunicorn --config gunicorn_config.py wsgi:app`
4. Add environment variables from `backend/RENDER_ENV_FINAL.txt`

### Frontend (Vercel)
1. Deploy to [Vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Framework preset: `Vite`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

## 🔧 Tech Stack

- **Backend**: Flask, MongoDB, JWT Authentication
- **Frontend**: React, Vite, Tailwind CSS
- **Real-time**: WebSocket, Socket.IO
- **Deployment**: Render (Backend), Vercel (Frontend)

## 📁 Project Structure

```
TNCA/
├── backend/          # Flask API server
├── frontend/         # React application
└── README.md         # This file
```

## 🔐 Environment Variables

Copy environment variables from `backend/RENDER_ENV_FINAL.txt` to your Render dashboard.

## 🎯 Features

- Interactive IQ quizzes
- Real-time gaming
- User analytics
- Admin dashboard
- Developer tools
- Export functionality 
