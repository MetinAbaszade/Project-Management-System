import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Search, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = ({ pageTitle }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Refs for click outside handling
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Effect for closing dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    setUnreadNotifications(0);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const viewAllNotifications = () => {
    setShowNotifications(false);
    // Navigate to notifications page
    navigate('/notifications');
  };

  const handleNotificationClick = (id) => {
    console.log('Notification clicked:', id);
  };

  const notifications = [
    { id: '1', message: 'John Doe assigned you a new task', time: '5 mins ago', read: false },
    { id: '2', message: 'New comment on "Design homepage mockup"', time: '1 hour ago', read: false },
    { id: '3', message: 'Your task "Setup developer environment" was approved', time: '3 hours ago', read: true }
  ];

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-sans">{pageTitle}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative h-10" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-750 ${notification.read ? 'opacity-70' : ''} cursor-pointer`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'} mt-2 mr-3 flex-shrink-0`} />
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button 
                  onClick={viewAllNotifications}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

        {/* User Info + Dropdown */}
        <div className="relative group" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">J</div>
            <span className="ml-2 font-medium">John Doe</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Profile
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Settings
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;