'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  Tag, 
  X,
  ArrowDown,
  Sliders,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { format, isPast, isToday, addDays } from 'date-fns';

// API imports
import { getCurrentUserTasks, markTaskComplete } from '@/api/TaskAPI';
import { getProjects } from '@/api/ProjectAPI';
import { useUser } from '@/hooks/useUser';

// CSS animations for iOS-like feel
import './tasks.css';

const TasksPage = () => {
  const router = useRouter();
  const { user } = useUser();
  
  // States
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('deadline');

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
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
    
    loadData();
  }, []);

  // Handle task completion
  const handleCompleteTask = async (taskId) => {
    try {
      await markTaskComplete(taskId);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.Id === taskId 
            ? { ...task, Status: 'Completed', Completed: true } 
            : task
        )
      );
      
      toast.success('Task completed!');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
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
      if (statusFilter !== 'all' && task.Status !== statusFilter) {
        return false;
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
        
        if (timeFilter === 'today' && !isToday(deadline)) {
          return false;
        }
        
        if (timeFilter === 'week' && (deadline < today || deadline > nextWeek)) {
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
      if (sortBy === 'deadline') {
        if (!a.Deadline) return 1;
        if (!b.Deadline) return -1;
        return new Date(a.Deadline) - new Date(b.Deadline);
      }
      
      if (sortBy === 'priority') {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return priorityOrder[a.Priority] - priorityOrder[b.Priority];
      }
      
      if (sortBy === 'created') {
        return new Date(b.CreatedAt) - new Date(a.CreatedAt);
      }
      
      return 0;
    });
  }, [filteredTasks, sortBy]);
  
  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'var(--task-high-priority)';
      case 'MEDIUM': return 'var(--task-medium-priority)';
      case 'LOW': return 'var(--task-low-priority)';
      default: return 'var(--task-low-priority)';
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setTimeFilter('all');
    setShowCompleted(true);
    setSortBy('deadline');
    setShowFilters(false);
  };

  // Task count message
  const getTaskCountMessage = () => {
    if (loading) return 'Loading tasks...';
    if (tasks.length === 0) return 'No tasks assigned to you';
    
    const filteredCount = sortedTasks.length;
    const totalCount = tasks.length;
    
    if (filteredCount === totalCount) {
      return `${totalCount} ${totalCount === 1 ? 'task' : 'tasks'}`;
    }
    
    return `${filteredCount} of ${totalCount} ${totalCount === 1 ? 'task' : 'tasks'}`;
  };

  return (
    <div className="task-container">
      <div className="task-header">
        <div className="task-header-content">
          <h1>My Tasks</h1>
          <p className="task-subtitle">Manage and track your assigned tasks</p>
        </div>
        <div className="task-count">{getTaskCountMessage()}</div>
      </div>
      
      <div className="task-search-container">
        <div className="task-search-bar">
          <Search className="task-search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="task-search-input"
          />
          {searchQuery && (
            <button 
              className="task-search-clear" 
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="task-filter-controls">
          <button 
            className={`task-filter-button ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          
          <button 
            className="task-filter-button"
            onClick={() => setSortBy(sortBy === 'deadline' ? 'priority' : sortBy === 'priority' ? 'created' : 'deadline')}
          >
            <ArrowDown size={16} />
            <span>Sort: {sortBy === 'deadline' ? 'Deadline' : sortBy === 'priority' ? 'Priority' : 'Recent'}</span>
          </button>
          
          <button 
            className={`task-toggle-button ${showCompleted ? '' : 'active'}`}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <CheckCircle2 size={16} />
            <span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
          </button>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="task-filters-panel">
          <div className="task-filters-grid">
            <div className="task-filter-group">
              <label>Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div className="task-filter-group">
              <label>Priority</label>
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            
            <div className="task-filter-group">
              <label>Timeframe</label>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">Any Time</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            {projects.length > 0 && (
              <div className="task-filter-group">
                <label>Project</label>
                <select 
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
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
          
          <div className="task-filters-actions">
            <button className="task-reset-button" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Active filters */}
      {(statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || timeFilter !== 'all' || !showCompleted) && (
        <div className="task-active-filters">
          {statusFilter !== 'all' && (
            <div className="task-filter-tag">
              <span>Status: {statusFilter}</span>
              <button onClick={() => setStatusFilter('all')}>
                <X size={12} />
              </button>
            </div>
          )}
          
          {priorityFilter !== 'all' && (
            <div className="task-filter-tag">
              <span>Priority: {priorityFilter}</span>
              <button onClick={() => setPriorityFilter('all')}>
                <X size={12} />
              </button>
            </div>
          )}
          
          {projectFilter !== 'all' && (
            <div className="task-filter-tag">
              <span>Project: {projects.find(p => p.Id === projectFilter)?.Name}</span>
              <button onClick={() => setProjectFilter('all')}>
                <X size={12} />
              </button>
            </div>
          )}
          
          {timeFilter !== 'all' && (
            <div className="task-filter-tag">
              <span>
                {timeFilter === 'today' 
                  ? 'Due Today' 
                  : timeFilter === 'week' 
                    ? 'Due This Week' 
                    : 'Overdue'}
              </span>
              <button onClick={() => setTimeFilter('all')}>
                <X size={12} />
              </button>
            </div>
          )}
          
          {!showCompleted && (
            <div className="task-filter-tag">
              <span>Hiding Completed</span>
              <button onClick={() => setShowCompleted(true)}>
                <X size={12} />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Task list */}
      <div className="task-list">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="task-skeleton">
              <div className="task-skeleton-circle"></div>
              <div className="task-skeleton-content">
                <div className="task-skeleton-title"></div>
                <div className="task-skeleton-desc"></div>
                <div className="task-skeleton-footer">
                  <div className="task-skeleton-badge"></div>
                  <div className="task-skeleton-badge"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="task-error">
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="task-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          // Empty state
          <div className="task-empty">
            <div className="task-empty-icon">
              <CheckCircle2 size={48} />
            </div>
            <h2>No Tasks Assigned</h2>
            <p>
              You don't have any assigned tasks yet. Tasks will appear here
              once they're assigned to you.
            </p>
            <button 
              onClick={() => router.push('/projects')}
              className="task-empty-button"
            >
              Browse Projects
            </button>
          </div>
        ) : sortedTasks.length === 0 ? (
          // No tasks matching filters
          <div className="task-no-matches">
            <Filter size={24} />
            <h2>No matching tasks</h2>
            <p>No tasks match your current filters.</p>
            <button 
              onClick={resetFilters}
              className="task-reset-button"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          // Task list
          sortedTasks.map(task => (
            <div 
              key={task.Id} 
              className={`task-card ${task.Completed ? 'completed' : ''}`}
              onClick={() => router.push(`/tasks/${task.Id}`)}
            >
              <div 
                className="task-priority-indicator"
                style={{ backgroundColor: getPriorityColor(task.Priority) }}
              ></div>
              <div className="task-main">
                <button
                  className={`task-complete-button ${task.Completed ? 'completed' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!task.Completed && (task.UserId === user?.Id || task.CreatedBy === user?.Id)) {
                      handleCompleteTask(task.Id);
                    }
                  }}
                  disabled={task.Completed || (task.UserId !== user?.Id && task.CreatedBy !== user?.Id)}
                >
                  <CheckCircle2 size={20} />
                </button>
                
                <div className="task-content">
                  <h3 className={`task-title ${task.Completed ? 'completed' : ''}`}>
                    {task.Title}
                  </h3>
                  
                  {task.Description && (
                    <p className="task-description">
                      {task.Description}
                    </p>
                  )}
                  
                  <div className="task-meta">
                    {task.projectName && (
                      <div className="task-meta-item">
                        <Tag size={14} />
                        <span>{task.projectName}</span>
                      </div>
                    )}
                    
                    {task.Deadline && (
                      <div className={`task-meta-item ${
                        task.Completed ? '' : 
                        isPast(new Date(task.Deadline)) ? 'overdue' : 
                        isToday(new Date(task.Deadline)) ? 'due-today' : ''
                      }`}>
                        <Clock size={14} />
                        <span>
                          {task.Completed ? 'Completed' : 
                           isPast(new Date(task.Deadline)) ? 'Overdue' : 
                           isToday(new Date(task.Deadline)) ? 'Due today' : 
                           format(new Date(task.Deadline), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    
                    <div className={`task-status ${task.Status.toLowerCase().replace(' ', '-')}`}>
                      {task.Status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksPage;