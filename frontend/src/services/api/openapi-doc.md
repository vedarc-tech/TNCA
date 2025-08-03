# TNCA & Cubeskool Iqualizer API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### POST /auth/login
**Description:** User login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user",
      "iq_score": 120,
      "badge_level": "Silver Cubist"
    },
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### POST /auth/refresh
**Description:** Refresh access token
**Headers:** `Authorization: Bearer <refresh_token>`
**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_jwt_token"
  }
}
```

### GET /auth/me
**Description:** Get current user information
**Headers:** `Authorization: Bearer <access_token>`
**Response:**
```json
{
  "success": true,
  "message": "User information retrieved successfully",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "iq_score": 120,
    "badge_level": "Silver Cubist"
  }
}
```

### POST /auth/logout
**Description:** User logout
**Headers:** `Authorization: Bearer <access_token>`

### POST /auth/change-password
**Description:** Change user password
**Headers:** `Authorization: Bearer <access_token>`
**Request Body:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

---

## Admin Endpoints

### GET /admin/users
**Description:** Get all users (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`
**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user",
      "is_active": true,
      "iq_score": 120,
      "badge_level": "Silver Cubist"
    }
  ]
}
```

### POST /admin/users
**Description:** Create new user (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`
**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "name": "New User",
  "password": "password123"
}
```

### PUT /admin/users/{user_id}
**Description:** Update user (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`
**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "is_active": true
}
```

### DELETE /admin/users/{user_id}
**Description:** Delete user (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`

### POST /admin/users/{user_id}/reset-password
**Description:** Reset user password (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`
**Request Body:**
```json
{
  "new_password": "new_password"
}
```

### POST /admin/users/{user_id}/toggle-status
**Description:** Toggle user active status (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`

### GET /admin/quizzes
**Description:** Get all quizzes (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`

### POST /admin/quizzes
**Description:** Create new quiz (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`
**Request Body:**
```json
{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "category": "General",
  "difficulty": "Medium",
  "time_limit": 30,
  "total_marks": 100,
  "questions": [
    {
      "question_text": "What is 2+2?",
      "question_image": "optional_image_url",
      "options": ["3", "4", "5", "6"],
      "correct_answer": 1,
      "marks": 10
    }
  ]
}
```

### PUT /admin/quizzes/{quiz_id}
**Description:** Update quiz (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`

### DELETE /admin/quizzes/{quiz_id}
**Description:** Delete quiz (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`

### POST /admin/quizzes/{quiz_id}/toggle-status
**Description:** Toggle quiz active status (Admin only)
**Headers:** `Authorization: Bearer <admin_token>`

### GET /admin/dashboard/stats
**Description:** Get admin dashboard statistics
**Headers:** `Authorization: Bearer <admin_token>`
**Response:**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "total_users": 150,
    "active_users": 120,
    "total_quizzes": 25,
    "active_quizzes": 20,
    "recent_users": [...],
    "recent_quizzes": [...],
    "top_performers": [...]
  }
}
```

### POST /admin/admins
**Description:** Create new admin (Super Admin only)
**Headers:** `Authorization: Bearer <super_admin_token>`
**Request Body:**
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "name": "Admin User",
  "password": "admin_password"
}
```

---

## User Endpoints

### GET /user/dashboard
**Description:** Get user dashboard data
**Headers:** `Authorization: Bearer <user_token>`
**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "user": {...},
    "recent_quiz_attempts": [...],
    "recent_game_scores": [...],
    "available_quizzes": [...]
  }
}
```

### GET /user/profile
**Description:** Get user profile
**Headers:** `Authorization: Bearer <user_token>`

### PUT /user/profile
**Description:** Update user profile (limited fields)
**Headers:** `Authorization: Bearer <user_token>`
**Request Body:**
```json
{
  "name": "Updated Name",
  "profile_picture": "new_picture_url"
}
```

### GET /user/performance
**Description:** Get user performance history
**Headers:** `Authorization: Bearer <user_token>`
**Response:**
```json
{
  "success": true,
  "message": "Performance data retrieved successfully",
  "data": {
    "iq_score": 120,
    "badge_level": "Silver Cubist",
    "total_quizzes": 15,
    "total_games": 8,
    "performance_history": [...]
  }
}
```

### GET /user/leaderboard
**Description:** Get leaderboard
**Headers:** `Authorization: Bearer <user_token>`
**Response:**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": [
    {
      "id": "user_id",
      "name": "Top User",
      "iq_score": 150,
      "badge_level": "Gold Cubist"
    }
  ]
}
```

### GET /user/quizzes
**Description:** Get available quizzes for user
**Headers:** `Authorization: Bearer <user_token>`

### GET /user/quizzes/{quiz_id}
**Description:** Get specific quiz for user
**Headers:** `Authorization: Bearer <user_token>`

---

## Quiz Endpoints

### POST /quiz/{quiz_id}/start
**Description:** Start a quiz attempt
**Headers:** `Authorization: Bearer <user_token>`
**Response:**
```json
{
  "success": true,
  "message": "Quiz started successfully",
  "data": {
    "attempt_id": "attempt_id",
    "quiz": {...},
    "time_limit": 1800
  }
}
```

### POST /quiz/{quiz_id}/submit
**Description:** Submit quiz answers
**Headers:** `Authorization: Bearer <user_token>`
**Request Body:**
```json
{
  "attempt_id": "attempt_id",
  "answers": [0, 1, 2, 1, 0],
  "time_taken": 1200
}
```
**Response:**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "score": 8,
    "total_questions": 10,
    "percentage": 80,
    "time_taken": 1200,
    "new_iq_score": 125,
    "badge_level": "Silver Cubist"
  }
}
```

### GET /quiz/attempts
**Description:** Get user's quiz attempts
**Headers:** `Authorization: Bearer <user_token>`

### GET /quiz/attempts/{attempt_id}
**Description:** Get specific quiz attempt with details
**Headers:** `Authorization: Bearer <user_token>`

---

## Game Endpoints

### POST /game/start
**Description:** Start a new game
**Headers:** `Authorization: Bearer <user_token>`
**Request Body:**
```json
{
  "game_type": "cube_solver",
  "difficulty": "medium"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Game started successfully",
  "data": {
    "game_id": "game_id",
    "game_type": "cube_solver",
    "difficulty": "medium"
  }
}
```

### POST /game/{game_id}/submit
**Description:** Submit game score
**Headers:** `Authorization: Bearer <user_token>`
**Request Body:**
```json
{
  "score": 1500,
  "moves": 45,
  "time_taken": 180,
  "completed": true,
  "game_type": "cube_solver",
  "difficulty": "medium"
}
```

### GET /game/scores
**Description:** Get user's game scores
**Headers:** `Authorization: Bearer <user_token>`

### GET /game/leaderboard
**Description:** Get game leaderboard
**Headers:** `Authorization: Bearer <user_token>`
**Query Parameters:**
- `game_type`: Type of game (cube_solver, pattern_matcher, speed_cube)
- `difficulty`: Game difficulty (easy, medium, hard, expert)

### GET /game/stats
**Description:** Get user's game statistics
**Headers:** `Authorization: Bearer <user_token>`

---

## Analytics Endpoints (Admin Only)

### GET /analytics/performance
**Description:** Get overall performance analytics
**Headers:** `Authorization: Bearer <admin_token>`

### GET /analytics/user/{user_id}
**Description:** Get detailed analytics for a specific user
**Headers:** `Authorization: Bearer <admin_token>`

### GET /analytics/export/users
**Description:** Export users data to Excel
**Headers:** `Authorization: Bearer <admin_token>`

### GET /analytics/export/quiz-results
**Description:** Export quiz results to Excel
**Headers:** `Authorization: Bearer <admin_token>`

### GET /analytics/export/game-results
**Description:** Export game results to Excel
**Headers:** `Authorization: Bearer <admin_token>`

### GET /analytics/daily-stats
**Description:** Get daily statistics for the last 30 days
**Headers:** `Authorization: Bearer <admin_token>`

---

## Error Responses

All endpoints return error responses in the following format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Data Models

### User Model
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "name": "string",
  "role": "user|admin|super_admin",
  "is_active": "boolean",
  "profile_picture": "string",
  "created_at": "datetime",
  "last_login": "datetime",
  "iq_score": "number",
  "total_quizzes": "number",
  "total_games": "number",
  "badge_level": "string",
  "performance_history": "array"
}
```

### Quiz Model
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "Easy|Medium|Hard|Expert",
  "time_limit": "number",
  "total_marks": "number",
  "questions": "array",
  "is_active": "boolean",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "total_attempts": "number",
  "average_score": "number"
}
```

### Question Model
```json
{
  "question_text": "string",
  "question_image": "string (optional)",
  "options": "array",
  "correct_answer": "number",
  "marks": "number"
}
```

---

## Badge Levels
- **Novice Cubist**: IQ < 100
- **Bronze Cubist**: IQ 100-119
- **Silver Cubist**: IQ 120-139
- **Gold Cubist**: IQ 140-159
- **Platinum Cubist**: IQ 160-179
- **Diamond Cubist**: IQ 180+

---

## Game Types
- **cube_solver**: Interactive cube solving challenges
- **pattern_matcher**: Pattern recognition games
- **speed_cube**: Speed-based cube challenges

---

## Quiz Categories
- **General**: General knowledge questions
- **Mathematics**: Math and logic problems
- **Science**: Scientific concepts and facts
- **Logic**: Logical reasoning questions
- **Memory**: Memory and recall challenges
- **Spatial**: Spatial reasoning and visualization 