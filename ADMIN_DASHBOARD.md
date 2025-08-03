# TNCA Admin Dashboard

A comprehensive admin dashboard for managing The Next Cognitive Assessment (TNCA) platform with advanced user management, quiz administration, analytics, and reporting capabilities.

## 🚀 Features Overview

### 🔐 Secure Authentication
- **Role-based access control** (Admin, Super Admin)
- **JWT token authentication** with refresh tokens
- **Password reset functionality** for admin-created accounts
- **Session management** with configurable timeouts
- **No public sign-up** - all accounts are admin-created

### 👥 User Management
- **Create user accounts** with Name, Email, Password, and Role
- **Edit/Delete users** with full profile management
- **Reset passwords** for any user account
- **Toggle user status** (Active/Inactive)
- **Bulk operations** for user management
- **Search and filter** users by role, status, and other criteria
- **User activity tracking** with last login timestamps

### 📝 Quiz Management
- **Create/Edit/Delete quizzes** with comprehensive question editor
- **Question types support** with multiple choice options
- **Timer settings** for each quiz
- **Marks allocation** per question
- **Answer key management** with correct answer tracking
- **Quiz categories** (General, Mathematics, Science, Language, Logic)
- **Difficulty levels** (Easy, Medium, Hard)
- **Quiz preview** functionality
- **Activate/Deactivate** quizzes

### 📊 Analytics & Insights
- **Real-time dashboard** with key performance indicators
- **User engagement metrics** with daily/weekly/monthly views
- **IQ growth tracking** for individual students
- **Performance analytics** with score distributions
- **Participation insights** by category and difficulty
- **Top scorers leaderboard** with rankings
- **System health monitoring** with uptime and performance metrics

### 📈 Performance Analytics
- **Individual student tracking** with IQ growth charts
- **Average scores** and performance heatmaps
- **Progress monitoring** over time
- **Skill development** tracking
- **Comparative analytics** between users and groups

### 🏆 Leaderboard Control
- **Filter leaderboard** by quiz, game, or date range
- **Real-time updates** of rankings
- **Multiple leaderboard views** (Overall, Category-specific, Time-based)
- **Export leaderboard data** in various formats

### 📋 Content Management
- **Homepage content** management
- **Announcements** and instructions posting
- **Platform branding** customization
- **Logo and favicon** management
- **Theme customization** with color schemes

### 📊 Reporting System
- **Export results** in PDF and Excel formats
- **Daily/weekly analytics** dashboard
- **Custom report generation** with filters
- **Email report sharing** functionality
- **Report scheduling** and automation
- **Data visualization** with charts and graphs

### ⚙️ System Settings
- **Platform configuration** (name, description, limits)
- **Security settings** (password policies, session timeouts)
- **Email integration** (SMTP configuration)
- **Notification preferences** for various events
- **Appearance customization** (themes, colors, branding)
- **Backup and maintenance** settings

## 🎯 Gamification Features

### 🏅 Badge System
- **Bronze Cubist** (IQ 100-119)
- **Silver Cubist** (IQ 120-139)
- **Gold Cubist** (IQ 140-159)
- **Platinum Cubist** (IQ 160-179)
- **Diamond Cubist** (IQ 180+)
- **Novice Cubist** (IQ < 100)

### 📈 Level Progression
- **IQ-based progression** system
- **Performance tracking** with historical data
- **Achievement milestones** and celebrations
- **Motivational feedback** and encouragement

### 🎮 Interactive Elements
- **Attractive UI** designed for youth and students
- **Gamified interface** with progress indicators
- **Real-time feedback** and notifications
- **Engaging visual elements** and animations

## 🔧 Technical Architecture

### Frontend (React + Vite)
- **Modern React** with hooks and functional components
- **Tailwind CSS** for responsive design
- **Lucide React** for consistent iconography
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Context API** for state management

### Backend (Flask + MongoDB)
- **Flask REST API** with Blueprint organization
- **MongoDB** for flexible data storage
- **JWT authentication** with secure token handling
- **Role-based middleware** for access control
- **Comprehensive error handling** and validation

### Security Features
- **Password hashing** with bcrypt
- **JWT token validation** with refresh mechanism
- **Role-based access control** (RBAC)
- **Input validation** and sanitization
- **CORS protection** and security headers
- **Rate limiting** for API endpoints

## 📱 Responsive Design

The admin dashboard is fully responsive and works seamlessly on:
- **Desktop computers** (1920x1080 and above)
- **Laptops** (1366x768 and above)
- **Tablets** (768x1024 and above)
- **Mobile devices** (375x667 and above)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- MongoDB 4.4+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TNCA
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Backend (from backend directory)
   python server.py
   
   # Frontend (from frontend directory)
   npm run dev
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/<id>` - Update user
- `DELETE /api/admin/users/<id>` - Delete user
- `POST /api/admin/users/<id>/reset-password` - Reset password
- `POST /api/admin/users/<id>/toggle-status` - Toggle user status

### Quiz Management
- `GET /api/admin/quizzes` - Get all quizzes
- `POST /api/admin/quizzes` - Create quiz
- `PUT /api/admin/quizzes/<id>` - Update quiz
- `DELETE /api/admin/quizzes/<id>` - Delete quiz
- `POST /api/admin/quizzes/<id>/toggle-status` - Toggle quiz status

### Analytics
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/analytics/export` - Export analytics

### Reports
- `GET /api/admin/reports` - Get all reports
- `POST /api/admin/reports/generate` - Generate report
- `GET /api/admin/reports/<id>/download` - Download report
- `DELETE /api/admin/reports/<id>` - Delete report
- `POST /api/admin/reports/<id>/share` - Share report

### Settings
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update settings

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/activity` - Get recent activity

## 🎨 UI Components

### Dashboard Components
- **StatCard** - Display key metrics with icons and trends
- **QuickActionCard** - Fast access to common actions
- **ChartCard** - Wrapper for analytics charts
- **Modal** - Reusable modal dialogs

### Management Components
- **UserCard** - User information display
- **QuizCard** - Quiz information with actions
- **QuestionEditor** - Interactive question creation
- **ReportCard** - Report information and actions

### Layout Components
- **AdminLayout** - Main admin layout with sidebar
- **Sidebar** - Navigation and quick stats
- **Header** - Top navigation with search and user menu

## 🔒 Security Considerations

### Authentication & Authorization
- All admin routes require valid JWT tokens
- Role-based access control for different admin levels
- Session timeout configuration
- Password complexity requirements

### Data Protection
- User data encryption at rest
- Secure password hashing
- Input validation and sanitization
- SQL injection prevention (MongoDB)

### API Security
- Rate limiting on sensitive endpoints
- CORS configuration
- Request validation
- Error handling without sensitive data exposure

## 📈 Performance Optimization

### Frontend
- **Code splitting** for better load times
- **Lazy loading** of components
- **Optimized images** and assets
- **Caching strategies** for API responses

### Backend
- **Database indexing** for faster queries
- **Connection pooling** for MongoDB
- **Caching** for frequently accessed data
- **Pagination** for large datasets

## 🧪 Testing

### Frontend Testing
- **Unit tests** for components
- **Integration tests** for user flows
- **E2E tests** for critical paths

### Backend Testing
- **Unit tests** for API endpoints
- **Integration tests** for database operations
- **Security tests** for authentication

## 🚀 Deployment

### Production Setup
1. **Environment configuration**
2. **Database setup** with proper indexes
3. **SSL certificate** configuration
4. **Load balancer** setup
5. **Monitoring** and logging

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**TNCA Admin Dashboard** - Empowering educators with comprehensive cognitive assessment management tools. 