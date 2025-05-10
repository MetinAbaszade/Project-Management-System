import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Get the current page title from the path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };
  
  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar}
        currentPath={location.pathname}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={getPageTitle()} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;