import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminRoute } from './components/auth/AdminRoute'
import { DeveloperRoute } from './components/auth/DeveloperRoute'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import DeveloperLayout from './components/layout/DeveloperLayout'
import MaintenanceWrapper from './components/common/MaintenanceWrapper'
import AdminMaintenanceWrapper from './components/common/AdminMaintenanceWrapper'
import UserMaintenanceWrapper from './components/common/UserMaintenanceWrapper'
import UserLayout from './components/layout/UserLayout';

// Final cleanup on app startup
// import './utils/finalCleanup'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Privacy from './pages/Privacy'

// User Pages
import UserDashboard from './pages/user/Dashboard'
import UserProfile from './pages/user/Profile'
import UserQuizzes from './pages/user/Quizzes'
import UserGames from './pages/user/Games'
import UserPlayGames from './pages/user/PlayGames'
import UserTournaments from './pages/user/Tournaments'
import UserMatches from './pages/user/Matches'
import UserLeaderboard from './pages/user/Leaderboard'
import UserPerformance from './pages/user/Performance'
import QuizTaking from './pages/user/QuizTaking'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminQuizzes from './pages/admin/Quizzes'
import AdminGames from './pages/admin/Games'
import AdminPlayGames from './pages/admin/PlayGames'
import AdminTournaments from './pages/admin/Tournaments'
import AdminAnalytics from './pages/admin/Analytics'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

// Developer Pages
import DeveloperDashboard from './pages/developer/Dashboard'
import SystemControl from './pages/developer/SystemControl'
import UserManagement from './pages/developer/UserManagement'
import DatabaseManagement from './pages/developer/DatabaseManagement'
import SystemMonitor from './pages/developer/SystemMonitor'
import SecurityAudit from './pages/developer/SecurityAudit'
import Analytics from './pages/developer/Analytics'
import Logs from './pages/developer/Logs'
import Maintenance from './pages/developer/Maintenance'
import MaintenanceManagement from './pages/developer/MaintenanceManagement'

// Components
import LoadingSpinner from './components/common/LoadingSpinner'
import TabSessionDebug from './components/common/TabSessionDebug'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <MaintenanceWrapper routePath="/">
          <Layout>
            <Home />
          </Layout>
        </MaintenanceWrapper>
      } />
      <Route path="/home" element={
        <MaintenanceWrapper routePath="/home">
          <Layout>
            <Home />
          </Layout>
        </MaintenanceWrapper>
      } />
      <Route path="/about" element={
        <MaintenanceWrapper routePath="/about">
          <Layout>
            <About />
          </Layout>
        </MaintenanceWrapper>
      } />
      <Route path="/contact" element={
        <MaintenanceWrapper routePath="/contact">
          <Layout>
            <Contact />
          </Layout>
        </MaintenanceWrapper>
      } />
      <Route path="/privacy" element={
        <MaintenanceWrapper routePath="/privacy">
          <Layout>
            <Privacy />
          </Layout>
        </MaintenanceWrapper>
      } />
      <Route path="/login" element={
        user ? (
          user.role === 'developer' ? 
            <Navigate to="/developer" /> :
            user.role === 'admin' || user.role === 'super_admin' ? 
              <Navigate to="/admin" /> : 
              <Navigate to="/dashboard" />
        ) : (
          <Layout>
            <Login />
          </Layout>
        )
      } />

      {/* User Routes with UserLayout */}
      <Route element={
        <ProtectedRoute>
          <UserMaintenanceWrapper>
            <UserLayout />
          </UserMaintenanceWrapper>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/quizzes" element={<UserQuizzes />} />
        <Route path="/quizzes/:quizId" element={<QuizTaking />} />
        <Route path="/games" element={<UserGames />} />
        <Route path="/play-games" element={<UserPlayGames />} />
        <Route path="/tournaments" element={<UserTournaments />} />
        <Route path="/matches" element={<UserMatches />} />
        <Route path="/leaderboard" element={<UserLeaderboard />} />
        <Route path="/performance" element={<UserPerformance />} />
      </Route>

      {/* Admin Routes with AdminLayout */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminMaintenanceWrapper>
            <AdminLayout />
          </AdminMaintenanceWrapper>
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="games" element={<AdminGames />} />
        <Route path="play-games" element={<AdminPlayGames />} />
        <Route path="tournaments" element={<AdminTournaments />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Developer Routes with DeveloperLayout */}
      <Route path="/developer" element={
        <DeveloperRoute>
          <DeveloperLayout />
        </DeveloperRoute>
      }>
        <Route index element={<DeveloperDashboard />} />
        <Route path="system" element={<SystemControl />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="database" element={<DatabaseManagement />} />
        <Route path="monitor" element={<SystemMonitor />} />
        <Route path="security" element={<SecurityAudit />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="logs" element={<Logs />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="maintenance-management" element={<MaintenanceManagement />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppWithDebug />
    </AuthProvider>
  )
}

function AppWithDebug() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <AppRoutes />
      {/* Only show debug panel in development mode and for developers only */}
      {import.meta.env.DEV && user?.role === 'developer' && <TabSessionDebug />}
    </div>
  )
}

export default App 