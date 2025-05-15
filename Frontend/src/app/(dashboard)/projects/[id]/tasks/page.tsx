'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Calendar,
  Flag,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// API and utils
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectTasks, markTaskComplete } from '@/api/TaskAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// CSS for animations and layout
import './taskStyles.css';

export default function ProjectTasksPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // State
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Fetch project and tasks
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [projectData, tasksData] = await Promise.all([
          getProjectById(id as string),
          getProjectTasks(id as string)
        ]);
        
        setProject(projectData);
        setTasks(tasksData || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        setError(err?.message || 'Failed to load project tasks');
        toast.error('Could not load tasks for this project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Check if user is project owner
  const isProjectOwner = useMemo(() => {
    if (!project || !userId) return false;
    return project.OwnerId === userId;
  }, [project, userId]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    
    return tasks
      .filter(task => {
        // Search filter
        if (searchQuery && !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Priority filter
        if (priorityFilter !== 'all' && task.Priority !== priorityFilter) {
          return false;
        }
        
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'Completed' && !task.Completed) return false;
          if (statusFilter === 'In Progress' && task.Status !== 'In Progress') return false;
          if (statusFilter === 'Not Started' && task.Status !== 'Not Started') return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        
        if (sortBy === 'deadline') {
          if (!a.Deadline) return 1 * multiplier;
          if (!b.Deadline) return -1 * multiplier;
          return (new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime()) * multiplier;
        }
        
        if (sortBy === 'priority') {
          const priorityOrder = { HIGH: 2, MEDIUM: 1, LOW: 0 };
          return (priorityOrder[a.Priority] - priorityOrder[b.Priority]) * multiplier;
        }
        
        if (sortBy === 'title') {
          return a.Title.localeCompare(b.Title) * multiplier;
        }
        
        if (sortBy === 'status') {
          const statusOrder = { 'Not Started': 0, 'In Progress': 1, 'Completed': 2 };
          const aStatus = a.Status || (a.Completed ? 'Completed' : 'Not Started');
          const bStatus = b.Status || (b.Completed ? 'Completed' : 'Not Started');
          return (statusOrder[aStatus] - statusOrder[bStatus]) * multiplier;
        }
        
        return 0;
      });
  }, [tasks, searchQuery, priorityFilter, statusFilter, sortBy, sortDirection]);

  // Group tasks by status for Kanban view if needed
  const groupedTasks = useMemo(() => {
    return {
      'Not Started': filteredTasks.filter(task => !task.Completed && (task.Status === 'Not Started' || !task.Status)),
      'In Progress': filteredTasks.filter(task => !task.Completed && task.Status === 'In Progress'),
      'Completed': filteredTasks.filter(task => task.Completed || task.Status === 'Completed'),
    };
  }, [filteredTasks]);

  // Handle task completion
  const handleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await markTaskComplete(taskId);
      
      // Update local state
      setTasks(prevTasks => prevTasks.map(task => 
        task.Id === taskId ? { ...task, Status: 'Completed', Completed: true } : task
      ));
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortBy('deadline');
    setSortDirection('asc');
  };

  // Determine if user can complete a task
  const canCompleteTask = (task: any) => {
    if (task.Completed) return false;
    return isProjectOwner || userId === task.UserId || userId === task.CreatedBy;
  };

  // UI Helper for priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'var(--destructive)';
      case 'MEDIUM': return 'var(--warning)';
      case 'LOW': return 'var(--success)';
      default: return 'var(--muted-foreground)';
    }
  };

  // UI Helper for deadline status
  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null;
    
    try {
      const date = parseISO(deadline);
      if (isPast(date) && !isToday(date)) return { label: 'Overdue', color: 'text-destructive' };
      if (isToday(date)) return { label: 'Due today', color: 'text-warning' };
      return null;
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="task-container flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-container flex items-center justify-center min-h-[50vh]">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Failed to load tasks</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => router.push(`/projects/${id}`)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Back to Project
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-tasks-container">
      {/* Header with back button, title and create button */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${id}`)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back to project"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold">{project?.Name || 'Project'} Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {filteredTasks.length !== tasks.length && ` (filtered from ${tasks.length})`}
            </p>
          </div>
        </div>
        
        {isProjectOwner && (
          <Link href={`/projects/${id}/tasks/create`}>
            <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </Link>
        )}
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
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all cursor-pointer"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="status">Sort by Status</option>
            </select>
            
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-3 py-2 rounded-lg border bg-background border-border hover:bg-muted transition-colors"
              aria-label={sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              {sortDirection === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      
      {/* Main content - Task grid */}
      {tasks.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Tasks Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {isProjectOwner
              ? "Get started by creating tasks and assigning them to team members."
              : "The project owner hasn't created any tasks for this project yet."}
          </p>
          
          {isProjectOwner && (
            <Link href={`/projects/${id}/tasks/create`}>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </button>
            </Link>
          )}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2">No Matching Tasks</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            No tasks match your current filters or search criteria.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Not Started Column */}
          <div className="task-column">
            <div className="bg-muted/40 p-4 rounded-t-lg border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Not Started</h3>
                <span className="bg-background px-2 py-1 text-xs rounded-full">
                  {groupedTasks['Not Started'].length}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {groupedTasks['Not Started'].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No tasks in this category
                </div>
              ) : (
                groupedTasks['Not Started'].map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    canComplete={canCompleteTask(task)}
                    onComplete={handleCompleteTask}
                    onClick={() => router.push(`/tasks/${task.Id}`)}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className="task-column">
            <div className="bg-primary/10 p-4 rounded-t-lg border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">In Progress</h3>
                <span className="bg-background px-2 py-1 text-xs rounded-full">
                  {groupedTasks['In Progress'].length}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {groupedTasks['In Progress'].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No tasks in this category
                </div>
              ) : (
                groupedTasks['In Progress'].map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    canComplete={canCompleteTask(task)}
                    onComplete={handleCompleteTask}
                    onClick={() => router.push(`/tasks/${task.Id}`)}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Completed Column */}
          <div className="task-column">
            <div className="bg-success/10 p-4 rounded-t-lg border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Completed</h3>
                <span className="bg-background px-2 py-1 text-xs rounded-full">
                  {groupedTasks['Completed'].length}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {groupedTasks['Completed'].length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No tasks in this category
                </div>
              ) : (
                groupedTasks['Completed'].map((task) => (
                  <TaskCard
                    key={task.Id}
                    task={task}
                    canComplete={false}
                    onComplete={handleCompleteTask}
                    onClick={() => router.push(`/tasks/${task.Id}`)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, canComplete, onComplete, onClick }) {
  const deadlineStatus = task.Deadline ? getDeadlineStatus(task.Deadline) : null;
  
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "cursor-pointer bg-card border rounded-lg overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md",
        task.Completed && "opacity-75"
      )}
      onClick={onClick}
    >
      <div className="flex">
        <div 
          className="w-1.5" 
          style={{ backgroundColor: getPriorityColor(task.Priority) }}
        />
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h4 className={cn("font-medium", task.Completed && "line-through opacity-70")}>
              {task.Title}
            </h4>
            
            <div className="flex-shrink-0">
              <span 
                className={cn(
                  "px-2 py-1 text-xs rounded-full",
                  task.Priority === 'HIGH' && "bg-destructive/10 text-destructive",
                  task.Priority === 'MEDIUM' && "bg-warning/10 text-warning",
                  task.Priority === 'LOW' && "bg-success/10 text-success",
                )}
              >
                {task.Priority}
              </span>
            </div>
          </div>
          
          {task.Description && (
            <p className={cn(
              "text-sm text-muted-foreground line-clamp-2 mb-3",
              task.Completed && "opacity-70"
            )}>
              {task.Description}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.Deadline && (
                <div className={cn(
                  "flex items-center",
                  deadlineStatus?.color
                )}>
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{format(new Date(task.Deadline), 'MMM d')}</span>
                </div>
              )}
            </div>
            
            {canComplete && (
              <button
                onClick={(e) => onComplete(task.Id, e)}
                className="flex items-center justify-center h-6 w-6 rounded-full border border-muted-foreground/30 hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper functions
function getPriorityColor(priority: string) {
  switch (priority) {
    case 'HIGH': return 'var(--destructive)';
    case 'MEDIUM': return 'var(--warning)';
    case 'LOW': return 'var(--success)';
    default: return 'var(--muted-foreground)';
  }
}

function getDeadlineStatus(deadline: string | null) {
  if (!deadline) return null;
  
  try {
    const date = parseISO(deadline);
    if (isPast(date) && !isToday(date)) return { label: 'Overdue', color: 'text-destructive' };
    if (isToday(date)) return { label: 'Due today', color: 'text-warning' };
    return null;
  } catch (error) {
    return null;
  }
}