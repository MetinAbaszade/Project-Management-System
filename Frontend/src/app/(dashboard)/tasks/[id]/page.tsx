// src/app/(dashboard)/tasks/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// UI components and icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

// API imports
import { 
  getTaskById, 
  updateTask, 
  deleteTask, 
  markTaskComplete
} from '@/api/TaskAPI';
import { getProjectById, getProjectMembers } from '@/api/ProjectAPI';
import { toast } from '@/lib/toast';

// Components
import { TaskAttachments } from '@/components/task/TaskAttachments';
import { TaskSubtasks } from '@/components/task/TaskSubtasks';
import { ResourceAllocation } from '@/components/task/ResourceAllocation';
import { ResourceSection } from '@/components/task/ResourceSection';
import { TaskDialog } from '@/components/task/TaskDialog';

// Styles
import '@/styles/animations.css';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // Get user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      } else {
        // No token, redirect to login
        toast.error('Authentication required');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Authentication error');
      router.push('/login');
    }
  }, [router]);
  
  // Fetch task data
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) return;
      
      setLoading(true);
      try {
        // Fetch task details
        const taskData = await getTaskById(id as string);
        setTask(taskData);
        
        // Fetch associated project
        if (taskData.ProjectId) {
          const [projectData, membersData] = await Promise.all([
            getProjectById(taskData.ProjectId),
            getProjectMembers(taskData.ProjectId)
          ]);
          
          setProject(projectData);
          setProjectMembers(membersData || []);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching task data:', err);
        setError(err?.message || 'Failed to load task details');
        toast.error('Could not load task details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, userId, router]);
  
  // Check if user is project owner
  const isProjectOwner = project?.OwnerId === userId;
  
  // Check if user can complete this task
  const canCompleteTask = !task?.Completed && (
    isProjectOwner || task?.UserId === userId || task?.CreatedBy === userId
  );
  
  // Handle mark task as complete
  const handleCompleteTask = async () => {
    if (!task?.Id) return;
    
    setCompleting(true);
    try {
      await markTaskComplete(task.Id);
      
      // Update local state
      setTask(prev => ({
        ...prev,
        Status: 'Completed',
        Completed: true
      }));
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    } finally {
      setCompleting(false);
    }
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    if (!task?.Id) return;
    
    setDeleting(true);
    try {
      await deleteTask(task.Id);
      toast.success('Task deleted successfully');
      
      // Redirect back to project tasks page
      if (task.ProjectId) {
        router.push(`/projects/${task.ProjectId}/tasks`);
      } else {
        router.push('/tasks');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Could not delete task');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
  
  // Handle edit task success
  const handleEditSuccess = (updatedData) => {
    // Update local state with new data
    setTask(prev => ({
      ...prev,
      Title: updatedData.Title,
      Description: updatedData.Description,
      Priority: updatedData.Priority,
      Status: updatedData.Status,
      Deadline: updatedData.Deadline,
      UserId: updatedData.UserId,
      TeamId: updatedData.TeamId
    }));
    
    setIsEditDialogOpen(false);
    toast.success('Task updated successfully');
  };
  
  // Helper for deadline status
  const getDeadlineStatus = () => {
    if (!task?.Deadline) return null;
    
    try {
      const deadline = parseISO(task.Deadline);
      
      if (task.Completed) {
        return { label: 'Task completed', color: 'text-green-600 dark:text-green-400' };
      }
      
      if (isPast(deadline) && !isToday(deadline)) {
        return { label: 'Overdue', color: 'text-red-600 dark:text-red-400' };
      }
      
      if (isToday(deadline)) {
        return { label: 'Due today', color: 'text-amber-600 dark:text-amber-400' };
      }
      
      return null;
    } catch (e) {
      console.error('Invalid date format:', e);
      return null;
    }
  };
  
  // Priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400';
      case 'LOW': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };
  
  // Get priority badge styles
  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'LOW':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  // Get status badge styles
  const getStatusBadgeStyles = (status: string, completed: boolean) => {
    if (completed) {
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    }
    
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Not Started':
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !task) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm"
        >
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Error Loading Task</h2>
          <p className="text-muted-foreground">{error || 'Task not found'}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Go Back
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
    );
  }
  
  // Deadline status
  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold">Task Details</h1>
            <p className="text-muted-foreground mt-1">
              {project?.Name && `Project: ${project.Name}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canCompleteTask && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompleteTask}
              disabled={completing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 shadow-sm"
            >
              {completing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Mark Complete
            </motion.button>
          )}
          
          {isProjectOwner && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Edit className="h-4 w-4" />
                Edit
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
      
      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 border-b"
      >
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 px-1 -mb-px text-sm font-medium ${
              activeTab === 'details' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors`}
          >
            Details
          </button>
          
          <button
            onClick={() => setActiveTab('subtasks')}
            className={`pb-2 px-1 -mb-px text-sm font-medium ${
              activeTab === 'subtasks' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors`}
          >
            Subtasks
          </button>
          
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2 px-1 -mb-px text-sm font-medium ${
              activeTab === 'resources' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors`}
          >
            Resources
          </button>
          
          <button
            onClick={() => setActiveTab('attachments')}
            className={`pb-2 px-1 -mb-px text-sm font-medium ${
              activeTab === 'attachments' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors`}
          >
            Attachments
          </button>
        </div>
      </motion.div>
      
      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-semibold">{task.Title}</h2>
                    
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityBadgeStyles(task.Priority)}`}
                      >
                        {task.Priority} Priority
                      </span>
                      
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyles(task.Status, task.Completed)}`}
                      >
                        {task.Status || (task.Completed ? 'Completed' : 'Not Started')}
                      </span>
                    </div>
                  </div>
                  
                  {task.Description ? (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                      <p className="text-foreground whitespace-pre-wrap">{task.Description}</p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-muted-foreground text-sm italic">No description provided</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Deadline */}
                    {task.Deadline && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Deadline
                        </h3>
                        <p className="text-foreground">
                          {format(parseISO(task.Deadline), 'MMM d, yyyy')}
                        </p>
                        {deadlineStatus && (
                          <p className={deadlineStatus.color}>
                            {deadlineStatus.label}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Assignment */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                        {task.TeamId ? (
                          <Users className="h-4 w-4 mr-2" />
                        ) : (
                          <User className="h-4 w-4 mr-2" />
                        )}
                        Assigned To
                      </h3>
                      <p className="text-foreground">
                        {task.TeamId 
                          ? 'Team'
                          : task.UserId
                          ? (task.UserId === userId ? 'You' : 'User')
                          : 'Not assigned'}
                      </p>
                    </div>
                    
                    {/* Creation Info */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Created
                      </h3>
                      <p className="text-foreground">
                        {format(parseISO(task.CreatedAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        By {task.CreatedBy === userId ? 'you' : 'another user'}
                      </p>
                    </div>
                    
                    {/* Cost if available */}
                    {task.Cost > 0 && (
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Cost</h3>
                        <p className="text-foreground">${task.Cost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'subtasks' && (
              <motion.div
                key="subtasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
              >
                <TaskSubtasks 
                  taskId={task.Id} 
                  projectId={task.ProjectId} 
                  isOwner={isProjectOwner} 
                />
              </motion.div>
            )}
            
            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
              >
                <ResourceSection 
                  taskId={task.Id}
                  projectId={task.ProjectId}
                  isOwner={isProjectOwner}
                />
              </motion.div>
            )}
            
            {activeTab === 'attachments' && (
              <motion.div
                key="attachments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
              >
                <TaskAttachments 
                  taskId={task.Id}
                  projectId={task.ProjectId} 
                  isOwner={isProjectOwner} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Project Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b bg-muted/50">
              <h2 className="text-lg font-semibold">Project Info</h2>
            </div>
            
            <div className="p-4">
              {project ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                    <p className="font-medium">{project.Name}</p>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/projects/${project.Id}`)}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Project</span>
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground">Project information not available</p>
              )}
            </div>
          </motion.div>
          
          {/* Task Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b bg-muted/50">
              <h2 className="text-lg font-semibold">Task Status</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h3>
                  <div
                    className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex ${getStatusBadgeStyles(task.Status, task.Completed)}`}
                  >
                    {task.Status || (task.Completed ? 'Completed' : 'Not Started')}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                  <div
                    className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex ${getPriorityBadgeStyles(task.Priority)}`}
                  >
                    {task.Priority} Priority
                  </div>
                </div>
                
                {canCompleteTask && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCompleteTask}
                    disabled={completing}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 mt-4 shadow-sm"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Complete</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Edit Task Dialog */}
      <TaskDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        projectId={task.ProjectId}
        task={task}
        onSuccess={handleEditSuccess}
      />
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl border shadow-lg max-w-md w-full p-6"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-xl font-bold text-center mb-2">Delete Task</h2>
              <p className="text-muted-foreground text-center mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete Task</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}