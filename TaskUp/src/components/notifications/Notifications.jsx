import React, { useState, useEffect } from 'react';
import { Bell, Check, ArrowLeft, Filter, CheckCheck, MessageSquare, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setNotifications([
        { 
          id: '1', 
          type: 'task_assigned', 
          message: 'John Doe assigned you a new task "Design landing page"', 
          project: 'Website Redesign',
          time: '5 minutes ago', 
          read: false 
        },
        { 
          id: '2', 
          type: 'comment', 
          message: 'Sarah Miller commented on "Optimize database queries"', 
          project: 'Mobile App Development',
          time: '1 hour ago', 
          read: false 
        },
        { 
          id: '3', 
          type: 'task_completed', 
          message: 'Your task "Set up development environment" was approved', 
          project: 'Mobile App Development',
          time: '3 hours ago', 
          read: true 
        },
        { 
          id: '4', 
          type: 'project_update', 
          message: 'Project "Website Redesign" deadline has been extended to May 25', 
          project: 'Website Redesign',
          time: '5 hours ago', 
          read: true 
        },
        { 
          id: '5', 
          type: 'task_assigned', 
          message: 'Michael Chen assigned you a new task "Update privacy policy"', 
          project: 'Website Redesign',
          time: '1 day ago', 
          read: true 
        },
        { 
          id: '6', 
          type: 'comment', 
          message: 'Jennifer Lee commented on "Fix navigation menu"', 
          project: 'Website Redesign',
          time: '1 day ago', 
          read: true 
        },
        { 
          id: '7', 
          type: 'mention', 
          message: 'Lisa Park mentioned you in a comment on "Create content for social media"', 
          project: 'Marketing Campaign',
          time: '2 days ago', 
          read: true 
        },
        { 
          id: '8', 
          type: 'task_due', 
          message: 'Task "Implement authentication" is due tomorrow', 
          project: 'Mobile App Development',
          time: '2 days ago', 
          read: true 
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter notifications based on selected filter and search query
  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    if (selectedFilter === 'unread' && notification.read) {
      return false;
    }

    if (selectedFilter !== 'all' && selectedFilter !== 'unread') {
      if (notification.type !== selectedFilter) {
        return false;
      }
    }

    // Apply search
    if (searchQuery) {
      return (
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.project.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <Activity className="text-blue-500" size={18} />;
      case 'comment':
        return <MessageSquare className="text-green-500" size={18} />;
      case 'task_completed':
        return <CheckCheck className="text-green-500" size={18} />;
      case 'project_update':
        return <Bell className="text-purple-500" size={18} />;
      case 'mention':
        return <MessageSquare className="text-blue-500" size={18} />;
      case 'task_due':
        return <AlertTriangle className="text-yellow-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'task_assigned', label: 'Assigned Tasks' },
              { id: 'comment', label: 'Comments' },
              { id: 'task_completed', label: 'Completed Tasks' },
              { id: 'project_update', label: 'Project Updates' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedFilter === filter.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-650'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex space-x-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full md:w-64 pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:bg-white dark:focus:bg-gray-600 focus:border-gray-300 dark:focus:border-gray-600"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <button
              onClick={markAllAsRead}
              className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              <Check size={16} className="mr-2" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-start ${
                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="mt-1 mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {notification.message}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{notification.project}</span>
                    <span className="mx-2">•</span>
                    <span>{notification.time}</span>
                  </div>
                </div>
                {!notification.read && (
                  <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedFilter !== 'all' || searchQuery
                ? 'Try changing your filters or search term'
                : "You're all caught up!"}
            </p>
            {(selectedFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-blue-600 dark:text-blue-400 font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;