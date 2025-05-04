import React from 'react';
import { Navigate } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Projects from './components/projects/Projects';
import Tasks from './components/tasks/Tasks';
import Teams from './components/teams/Teams';
import Analytics from './components/analytics/Analytics';
import UserProfile from './components/user/UserProfile';
import ChatPanel from './components/chat/ChatPanel';

// Dashboard is used as the "home page"
import Dashboard from './components/Dashboard';

const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/projects', element: <Projects /> },
      { path: '/tasks', element: <Tasks /> },
      { path: '/teams', element: <Teams /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/chat/:projectId', element: <ChatPanel /> },
      { path: '/profile', element: <UserProfile /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> }
    ]
  }
];

export default routes;