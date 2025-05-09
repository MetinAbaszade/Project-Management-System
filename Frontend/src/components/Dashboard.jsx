import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import AddTaskModal from './tasks/AddTaskModal';

const Dashboard = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const notificationRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch dashboard data using API service
    const fetchDashboardData = async () => {
      try {
        // Use Promise.all to fetch data in parallel
        const [projectsData, tasksData, notificationsData] = await Promise.all([
          api.getProjects(),
          api.getTasks({ limit: 5 }), // Get only recent tasks for dashboard
          api.getNotifications({ limit: 3 }) // Get only recent notifications
        ]);
        
        setProjects(projectsData);
        setTasks(tasksData);
        setNotifications(notificationsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter tasks based on search term and priority
  useEffect(() => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, priorityFilter]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const createdTask = await api.createTask(newTask);
      setTasks(prevTasks => [createdTask, ...prevTasks]);
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      // Handle error - maybe show notification to user
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const viewAllNotifications = () => {
    setShowNotifications(false);
    // Navigate to all notifications page
    navigate('/notifications');
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="p-6">
      {/* Search & Filter Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-gray-300 dark:focus:border-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            
            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            {[
              { title: 'Total Projects', value: projects.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
              { title: 'Open Tasks', value: tasks.filter(t => t.status !== 'Completed').length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
              { title: 'Upcoming Deadlines', value: tasks.filter(t => new Date(t.deadline) < new Date(new Date().setDate(new Date().getDate() + 7))).length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' }
            ].map((card, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-semibold">{card.value}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Active Projects */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 animate-fade-in" style={{animationDelay: '300ms'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Active Projects</h2>
              <Link to="/projects" className="text-blue-600 dark:text-blue-400 text-sm font-medium">View all</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pl-3">Project</th>
                    <th className="pb-3">Progress</th>
                    <th className="pb-3">Deadline</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Teams</th>
                    <th className="pb-3">Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 animate-fade-in cursor-pointer"
                      style={{animationDelay: `${400 + index * 100}ms`}}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="py-4 pl-3">
                        <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div className="bg-blue-600 h-2.5 rounded-full animate-grow-width" style={{ width: `${project.progress}%`, animationDelay: `${500 + index * 100}ms` }}></div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(project.deadline)}</div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{project.teams}</div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{project.tasks}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Tasks and Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{animationDelay: '600ms'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Tasks</h2>
                <Link to="/tasks" className="text-blue-600 dark:text-blue-400 text-sm font-medium">View all</Link>
              </div>
              
              <div className="space-y-4">
                {(searchTerm || priorityFilter !== 'all' ? filteredTasks : tasks).slice(0, 4).map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 animate-fade-in cursor-pointer"
                    style={{animationDelay: `${700 + index * 100}ms`}}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className={`w-3 h-3 mt-1.5 rounded-full ${getPriorityColor(task.priority)} mr-3 flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{task.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{task.project}</div>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Due {formatDate(task.deadline)}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* No results message */}
                {(searchTerm || priorityFilter !== 'all') && filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No tasks match your search criteria.</p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setPriorityFilter('all');
                      }}
                      className="mt-2 text-blue-500 hover:text-blue-600"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{animationDelay: '800ms'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <button 
                  onClick={async () => {
                    try {
                      await api.markAllNotificationsAsRead();
                      setNotifications(notifications.map(n => ({...n, read: true})));
                    } catch (error) {
                      console.error('Error marking all notifications as read:', error);
                    }
                  }}
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                >
                  Mark all as read
                </button>
              </div>
              
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start p-3 rounded-lg ${notification.read ? 'opacity-75' : 'border-l-4 border-blue-500'} hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 animate-fade-in`}
                    style={{animationDelay: `${900 + index * 100}ms`}}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">{notification.message}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notification.time}</div>
                    </div>
                    {!notification.read && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No notifications yet.</p>
                  </div>
                )}
                
                {notifications.length > 0 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={viewAllNotifications}
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && <AddTaskModal 
        isOpen={showAddTaskModal}
        onAddTask={handleAddTask} 
        onClose={() => setShowAddTaskModal(false)} 
        projects={projects}
      />}
    </div>
  );
};

export default Dashboard;