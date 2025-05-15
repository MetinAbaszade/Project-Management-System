import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

// Layout
import Layout from './components/layout/Layout';

// Dashboard and main components
import Dashboard from './components/Dashboard';
import Projects from './components/projects/Projects';
import ProjectOverview from './components/projects/ProjectOverview';
import Tasks from './components/tasks/Tasks';
import TaskOverview from './components/tasks/TaskOverview';
import Teams from './components/teams/Teams';
import TeamOverview from './components/teams/TeamOverview';
import UserProfile from './components/user/UserProfile';
import ChatPanel from './components/chat/ChatPanel';
import Settings from './components/settings/Settings';
import Analytics from './components/analytics/Analytics';
import ForgotPassword from './components/auth/ForgotPassword';
import Notifications from './components/notifications/Notifications';

// Auth pages
import LandingPage from './components/auth/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public only route component (redirects if authenticated)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => {
  const { darkMode } = useTheme();
  const location = useLocation();

  // Add auth-body class to body for authentication pages
  useEffect(() => {
    const isAuthPage = 
      location.pathname === '/login' || 
      location.pathname === '/signup' || 
      location.pathname === '/forgot-password';
    
    if (isAuthPage) {
      document.body.classList.add('auth-body');
    } else {
      document.body.classList.remove('auth-body');
    }
    
    return () => {
      document.body.classList.remove('auth-body');
    };
  }, [location]);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <Routes>
        {/* Public routes for authentication */}
        <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

        {/* Protected routes inside Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectOverview />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:taskId" element={<TaskOverview />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:teamId" element={<TeamOverview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="chat/:projectId" element={<ChatPanel projectName="Website Redesign" />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;