# TNCA & Cubeskool Iqualizer - Project Summary

A comprehensive, gamified IQ challenge and tracking platform designed specifically for Tamil Nadu Cube Association (TNCA) & Cubeskool. The platform features admin-only user creation, interactive quizzes, cube-based games, real-time IQ tracking, and comprehensive analytics.

## 🏗️ Architecture

### Backend (Flask + MongoDB)
- **Framework**: Flask with JWT authentication
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT-based with role-based access control
- **Features**: RESTful API, file uploads, data export, analytics

### Frontend (React + Vite + Tailwind)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Context + React Query
- **UI/UX**: Responsive design with gamified elements

## 🔐 Security Features

- **Admin-only user creation** - No public sign-up
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (User, Admin, Super Admin)
- **Password hashing** with bcrypt
- **CORS protection** and input validation
- **Secure file uploads** with validation

## 👥 User Types & Permissions

### Super Admin
- **Email**: tamilnaducubeassociation@gmail.com
- **Password**: Tnca@600101
- **Permissions**: Full system access, create admins, all admin features

### Admin
- **Permissions**: User management, quiz management, analytics, reports
- **Features**: Create/edit/delete users, manage quizzes, view analytics

### User (Student)
- **Permissions**: Take quizzes, play games, view leaderboard, track performance
- **Features**: Interactive dashboard, IQ tracking, badge system

## 🎮 Core Features

### For Users
1. **Interactive Dashboard**
   - Real-time IQ score display
   - Performance graphs and trends
   - Recent activity feed
   - Achievement badges

2. **IQ Quizzes**
   - Multiple choice questions
   - Text and image support
   - Timed assessments
   - Real-time scoring
   - Performance feedback

3. **Cube Games**
   - Interactive cube-solving challenges
   - Pattern matching games
   - Speed-based challenges
   - Score tracking

4. **Gamification**
   - Badge system (Bronze → Diamond Cubist)
   - Leaderboard rankings
   - Progress tracking
   - Achievement notifications

5. **Performance Analytics**
   - IQ growth charts
   - Quiz performance history
   - Game statistics
   - Comparative analysis

### For Admins
1. **User Management**
   - Create/edit/delete users
   - Reset passwords
   - Activate/deactivate accounts
   - Bulk operations

2. **Quiz Management**
   - Create custom quizzes
   - Support for text and images
   - Question bank management
   - Difficulty levels

3. **Analytics & Reporting**
   - User performance analytics
   - Quiz statistics
   - Export functionality (Excel/PDF)
   - Real-time dashboards

4. **Content Management**
   - Announcements
   - System settings
   - Badge configuration

## 📊 IQ Calculation System

The platform uses a sophisticated IQ calculation system:
- **Base IQ**: 100 points
- **Difficulty multipliers**: Easy (0.8x), Medium (1.0x), Hard (1.2x), Expert (1.5x)
- **Performance-based adjustments**: Score-based IQ improvements
- **Badge progression**: Automatic badge upgrades based on IQ scores

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Classic colors with rich gradients
- **Typography**: Inter + Poppins fonts
- **Animations**: Framer Motion for smooth interactions
- **Responsive**: Mobile-first design approach

### Gamification Elements
- **Animated badges** with glow effects
- **Progress indicators** with animations
- **Confetti celebrations** for achievements
- **Interactive cube animations**
- **Real-time score updates**

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or Atlas)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd TNCA

# Run setup script
./start.sh  # Linux/Mac
start.bat   # Windows
```

### Manual Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
python server.py

# Frontend
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
TNCA/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   ├── requirements.txt # Python dependencies
│   └── server.py        # Main application
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── contexts/    # React contexts
│   │   └── App.jsx      # Main application
│   ├── package.json     # Node dependencies
│   └── vite.config.js   # Build configuration
├── api/
│   └── openapi-doc.md   # API documentation
├── start.sh             # Linux/Mac startup script
├── start.bat            # Windows startup script
└── setup.md             # Detailed setup guide
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

### Quiz Management
- `GET /api/user/quizzes` - Get available quizzes
- `POST /api/quiz/{id}/start` - Start quiz
- `POST /api/quiz/{id}/submit` - Submit quiz answers

### Analytics
- `GET /api/analytics/performance` - Overall analytics
- `GET /api/analytics/export/users` - Export user data
- `GET /api/analytics/export/quiz-results` - Export quiz results

## 🎯 Key Achievements

1. **Complete Full-Stack Solution**: Production-ready application with modern tech stack
2. **Gamified Learning**: Engaging user experience with rewards and achievements
3. **Admin Control**: Comprehensive admin panel for user and content management
4. **Real-time Analytics**: Live performance tracking and reporting
5. **Mobile Responsive**: Works seamlessly on all devices
6. **Scalable Architecture**: Modular design for easy maintenance and expansion
7. **Security First**: Robust authentication and authorization system
8. **Documentation**: Comprehensive API docs and setup guides

## 🚀 Deployment Ready

The application is production-ready with:
- Environment configuration
- Database optimization
- Security best practices
- Performance optimization
- Error handling
- Logging system

## 📞 Support & Contact

- **Email**: tamilnaducubeassociation@gmail.com
- **Phone**: +91 600 101 0000
- **Documentation**: See `setup.md` and `api/openapi-doc.md`

## 🎉 Success Metrics

- **User Engagement**: Gamified elements increase participation
- **Performance Tracking**: Real-time IQ monitoring
- **Admin Efficiency**: Streamlined user and content management
- **Scalability**: Modular architecture supports growth
- **User Experience**: Modern, responsive interface

---

*Built with ❤️ for Tamil Nadu Cube Association & Cubeskool* 