import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, CheckCircle, Circle, Calendar, Clock, ChevronDown, Filter as FilterIcon } from 'lucide-react';
import { api } from '../../services/api';
import AddTaskModal from './AddTaskModal';

const TaskItem = ({ task, index, toggleTask, onTaskClick }) => {
  const { id, title, project, deadline, completed, priority, status, assignedTo } = task;
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
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
  
  const formattedDate = new Date(deadline).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 mb-3 border border-gray-100 dark:border-gray-700 ${
        completed ? 'opacity-70' : ''
      } hover:shadow-md cursor-pointer transition-all animate-slide-up`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onTaskClick && onTaskClick(task)}
    >
      <div className="flex items-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(id);
          }} 
          className="flex-shrink-0 mr-3 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {completed ? 
            <CheckCircle className="w-6 h-6 text-blue-500" /> : 
            <Circle className="w-6 h-6" />
          }
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {title}
          </h3>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)} mr-2`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{project}</span>
            
            {assignedTo && (
              <>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Assigned to: {typeof assignedTo === 'string' ? assignedTo : assignedTo.name || 'Team'}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-4 space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskGroup = ({ date, tasks, toggleTask, onTaskClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center mb-3 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center">
          <ChevronDown className={`w-5 h-5 text-gray-500 mr-2 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date}</h2>
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2"></div>
        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
          {tasks.length} tasks
        </div>
      </div>
      
      {!collapsed && (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              index={index} 
              toggleTask={toggleTask}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch tasks data
  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        setIsLoading(true);
        const tasksData = await api.getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, []);

  // Fetch projects, teams, and users for filters and task creation
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [projectsData, teamsData, usersData] = await Promise.all([
          api.getProjects(),
          api.getTeams(),
          api.getUsers()
        ]);
        
        setProjects(projectsData);
        setTeams(teamsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchFilterData();
  }, []);
  
  const toggleTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      const updatedTask = {
        ...task,
        completed: !task.completed,
        status: !task.completed ? 'Completed' : 'In Progress'
      };
      
      await api.updateTask(id, updatedTask);
      
      setTasks(tasks.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };
  
  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`, { state: { task } });
  };

  const addTask = async (newTask) => {
    try {
      const createdTask = await api.createTask(newTask);
      setTasks([...tasks, createdTask]);
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
  };
  
  const getUpcomingDates = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return {
      start: today.toISOString().split('T')[0],
      end: nextWeek.toISOString().split('T')[0]
    };
  };
  
  // Apply all filters
  const filteredTasks = tasks.filter(task => {
    // Filter by tab
    if (filter === 'today' && task.deadline !== getTodayDate()) return false;
    if (filter === 'upcoming') {
      const { start, end } = getUpcomingDates();
      if (!(task.deadline >= start && task.deadline <= end)) return false;
    }
    if (filter === 'completed' && !task.completed) return false;
    
    // Search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.project.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Project filter
    if (selectedProject !== 'all' && task.project !== selectedProject) return false;
    
    // Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    
    return true;
  });
  
  // Group tasks by date
  const groupTasksByDate = () => {
    const grouped = {};
    
    filteredTasks.forEach(task => {
      const date = new Date(task.deadline);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }
      
      grouped[formattedDate].push(task);
    });
    
    // Sort the dates
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, dateTasks]) => ({ date, tasks: dateTasks }));
  };
  
  const groupedTasks = groupTasksByDate();
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <button 
            onClick={() => setShowAddTaskModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <Plus size={18} className="mr-2" />
            <span>Add Task</span>
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="mt-6 flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.id
                  ? 'bg-white dark:bg-gray-800 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search and Filters */}
        <div className="mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
            >
              <FilterIcon size={18} className="mr-2" />
              <span>Filter</span>
              <ChevronDown 
                className={`ml-2 w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>
        </div>
        
        {/* Advanced Filters (collapsible) */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.name}>{project.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setSelectedProject('all');
                    setSelectedPriority('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Task List */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center mb-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2"></div>
                  <div className="ml-2 h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            ))}
          </div>
        ) : groupedTasks.length > 0 ? (
          groupedTasks.map((group, index) => (
            <TaskGroup 
              key={group.date} 
              date={group.date} 
              tasks={group.tasks} 
              toggleTask={toggleTask}
              onTaskClick={handleTaskClick}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filter === 'all' && searchQuery === '' && selectedProject === 'all' && selectedPriority === 'all'
                ? "You don't have any tasks yet." 
                : "No tasks match your current filters."}
            </p>
            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Add a task
            </button>
          </div>
        )}
      </div>
      
      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onAddTask={addTask}
          projects={projects}
          teams={teams}
          users={users}
        />
      )}
    </div>
  );
};

export default Tasks;