// src/app/(dashboard)/projects/[id]/tasks/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  LayoutGrid,
  LayoutList,
  X,
  ChevronsUpDown,
  SlidersHorizontal
} from 'lucide-react';

// API and utils
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectTasks } from '@/api/TaskAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// Components
import { TaskList } from '@/components/task/TaskList';

// Import animations
import '@/styles/animations.css';

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
  
  // View mode (list or kanban)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  
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

  // Refresh tasks
  const refreshTasks = async () => {
    if (!id) return;
    
    try {
      const tasksData = await getProjectTasks(id as string);
      setTasks(tasksData || []);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      toast.error('Could not refresh tasks');
    }
  };

  // Navigate to create task page
  const navigateToCreateTask = () => {
    router.push(`/projects/${id}/tasks/create`);
  };

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

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortBy('deadline');
    setSortDirection('asc');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm"
          >
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
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with back button, title and create button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-start mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${id}`)}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back to project"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project?.Name || 'Project'} Tasks</h1>
            <p className="text-muted-foreground mt-1">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {filteredTasks.length !== tasks.length && ` (filtered from ${tasks.length})`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            className="inline-flex items-center px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all shadow-sm"
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
          </motion.button>
          
          {isProjectOwner && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={navigateToCreateTask}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </motion.button>
          )}
        </div>
      </motion.div>
      
      {/* Search and filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all shadow-sm"
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 rounded-lg border ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'} transition-colors shadow-sm`}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </motion.button>
            
            <div className="relative inline-block">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center px-3 py-2 rounded-lg border bg-background border-border hover:bg-muted transition-colors shadow-sm"
              >
                <span className="mr-2 hidden sm:inline">Sort by</span>
                <span className="mr-1">{
                  sortBy === 'deadline' ? 'Deadline' : 
                  sortBy === 'priority' ? 'Priority' : 
                  sortBy === 'title' ? 'Title' : 'Status'
                }</span>
                <ChevronsUpDown className="h-4 w-4" />
              </motion.button>
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
                  onClick={() => setSortBy('title')}
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm transition-colors whitespace-nowrap"
                >
                  Title
                </button>
                <button 
                  onClick={() => setSortBy('status')}
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm transition-colors whitespace-nowrap"
                >
                  Status
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter panel */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showFilters ? 'auto' : 0, 
            opacity: showFilters ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {showFilters && (
            <div className="bg-card border rounded-lg shadow-sm">
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
            </div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Task List or Kanban */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            userRole={isProjectOwner ? 'project_owner' : 'member'}
            currentUserId={userId || ''}
            projectId={id as string}
            loading={false}
            error={null}
            onTasksChange={refreshTasks}
            viewMode={viewMode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-card/50 rounded-lg border border-dashed border-border">
            <div className="text-center max-w-md px-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">
                {tasks.length === 0 
                  ? "This project doesn't have any tasks yet. Create your first task to get started." 
                  : "No tasks match your current filters. Try adjusting your search or filters."}
              </p>
              
              {isProjectOwner && tasks.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={navigateToCreateTask}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </motion.button>
              )}
              
              {tasks.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary hover:text-primary/80 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}