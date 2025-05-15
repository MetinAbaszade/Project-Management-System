// src/app/(dashboard)/tasks/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search, 
  X,
  ChevronsUpDown,
  LayoutGrid,
  LayoutList,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { format, isPast, addDays } from 'date-fns';

// API imports
import { getCurrentUserTasks } from '@/api/TaskAPI';
import { getProjects } from '@/api/ProjectAPI';

// Components
import { TaskList } from '@/components/task/TaskList';

const TasksPage = () => {
  const router = useRouter();
  
  // States
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('deadline');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // View mode (list or kanban)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Get user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tasks and projects in parallel
        const [tasksData, projectsData] = await Promise.all([
          getCurrentUserTasks(),
          getProjects()
        ]);
        
        // Map project names to tasks
        const enhancedTasks = tasksData.map(task => {
          const project = projectsData.find(p => p.Id === task.ProjectId);
          return {
            ...task,
            projectName: project?.Name || 'Unknown Project'
          };
        });
        
        setTasks(enhancedTasks);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setError('There was a problem loading your tasks. Please try again.');
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadData();
    }
  }, [userId]);

  // Refresh tasks
  const refreshTasks = async () => {
    if (!userId) return;
    
    try {
      const tasksData = await getCurrentUserTasks();
      
      // Map project names to tasks
      const enhancedTasks = tasksData.map(task => {
        const project = projects.find(p => p.Id === task.ProjectId);
        return {
          ...task,
          projectName: project?.Name || 'Unknown Project'
        };
      });
      
      setTasks(enhancedTasks);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      toast.error('Could not refresh tasks');
    }
  };
  
  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Skip completed tasks if not showing
      if (!showCompleted && task.Completed) return false;
      
      // Search filter
      if (searchQuery && 
          !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Completed' && !task.Completed) return false;
        if (statusFilter === 'In Progress' && task.Status !== 'In Progress') return false;
        if (statusFilter === 'Not Started' && task.Status !== 'Not Started') return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && task.Priority !== priorityFilter) {
        return false;
      }
      
      // Project filter
      if (projectFilter !== 'all' && task.ProjectId !== projectFilter) {
        return false;
      }
      
      // Time filter
      if (timeFilter !== 'all' && task.Deadline) {
        const deadline = new Date(task.Deadline);
        const today = new Date();
        const nextWeek = addDays(today, 7);
        const nextMonth = addDays(today, 30);
        
        if (timeFilter === 'today' && !format(deadline, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
          return false;
        }
        
        if (timeFilter === 'week' && (deadline < today || deadline > nextWeek)) {
          return false;
        }
        
        if (timeFilter === 'month' && (deadline < today || deadline > nextMonth)) {
          return false;
        }
        
        if (timeFilter === 'overdue' && (!isPast(deadline) || task.Completed)) {
          return false;
        }
      } else if (timeFilter !== 'all' && !task.Deadline) {
        // Filter out tasks with no deadline if time filter is active
        return false;
      }
      
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, timeFilter, showCompleted]);
  
  // Sort filtered tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (sortBy === 'deadline') {
        if (!a.Deadline) return 1 * multiplier;
        if (!b.Deadline) return -1 * multiplier;
        return (new Date(a.Deadline) - new Date(b.Deadline)) * multiplier;
      }
      
      if (sortBy === 'priority') {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return (priorityOrder[a.Priority] - priorityOrder[b.Priority]) * multiplier;
      }
      
      if (sortBy === 'created') {
        return (new Date(b.CreatedAt) - new Date(a.CreatedAt)) * multiplier;
      }
      
      if (sortBy === 'project') {
        return a.projectName.localeCompare(b.projectName) * multiplier;
      }
      
      return 0;
    });
  }, [filteredTasks, sortBy, sortDirection]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setTimeFilter('all');
    setShowCompleted(true);
    setSortBy('deadline');
    setSortDirection('asc');
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
            {sortedTasks.length !== tasks.length && ` (filtered from ${tasks.length})`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            className="inline-flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all"
          >
            {viewMode === 'list' ? (
              <>
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Kanban View</span>
              </>
            ) : (
              <>
                <LayoutList className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">List View</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 rounded-lg border ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'} transition-colors`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <div className="relative inline-block">
              <button 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center px-3 py-2 rounded-lg border bg-background border-border hover:bg-muted transition-colors"
              >
                <span className="mr-2 hidden sm:inline">Sort by</span>
                <span className="mr-1">{
                  sortBy === 'deadline' ? 'Deadline' : 
                  sortBy === 'priority' ? 'Priority' : 
                  sortBy === 'created' ? 'Created' : 'Project'
                }</span>
                <ChevronsUpDown className="h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-1 bg-card border rounded-md shadow-md z-10 hidden group-hover:block">
                <button 
                  onClick={() => setSortBy('deadline')}
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm transition-colors whitespace-nowrap"
                >
                  Deadline
                </button>
                <button 
                  onClick={() => setSortBy('priority')}
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm transition-colors whitespace-nowrap"
                >
                  Priority
                </button>
                <button 
                  onClick={() => setSortBy('created')}
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm transition-colors whitespace-nowrap"
                >
                  Created
                </button>
                <button 
                  onClick={() => setSortBy('project')}
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm transition-colors whitespace-nowrap"
                >
                  Project
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`inline-flex items-center px-3 py-2 rounded-lg border ${!showCompleted ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'} transition-colors`}
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>
        </div>
        
        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-card border rounded-lg shadow-sm"
            >
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeframe</label>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">Any Time</option>
                      <option value="today">Due Today</option>
                      <option value="week">Due This Week</option>
                      <option value="month">Due This Month</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  
                  {projects.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Project</label>
                      <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="all">All Projects</option>
                        {projects.map(project => (
                          <option key={project.Id} value={project.Id}>
                            {project.Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:text-primary/80 hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Task List */}
      <TaskList
        tasks={sortedTasks}
        userRole="member"
        currentUserId={userId || ''}
        loading={loading}
        error={error}
        showProjectInfo={true}
        onTasksChange={refreshTasks}
        viewMode={viewMode}
      />
    </div>
  );
};

export default TasksPage;