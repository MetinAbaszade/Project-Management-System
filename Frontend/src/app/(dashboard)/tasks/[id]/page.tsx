// src/app/tasks/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle,
  User,
  Users,
  Briefcase,
  Loader2,
  AlertCircle,
  Tag,
  FileText,
  Paperclip,
  ListTree
} from 'lucide-react';

// API imports
import { getTaskById, updateTask, deleteTask, markTaskComplete } from '@/api/TaskAPI';
import { getProjectById, getProjectMembers, getProjectTeams } from '@/api/ProjectAPI';
import { getCurrentUser } from '@/api/UserAPI';
import { toast } from '@/lib/toast';

// Component imports
import { TaskTreeView } from '@/components/task/TaskTreeView';
import { TaskAttachments } from '@/components/task/TaskAttachments';
import { TaskDialog } from '@/components/task/TaskDialog';
import { cn } from '@/lib/utils';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectTeams, setProjectTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hierarchy');
  
  // Get user ID from userData stored in localStorage
  useEffect(() => {
    try {
      const user = getCurrentUser();
      if (user && user.Id) {
        setUserId(user.Id);
        console.log('[TaskDetailPage] User authenticated:', { id: user.Id });
      } else {
        // No user data, redirect to login
        console.error('[TaskDetailPage] No user data found');
        toast.error('Authentication required');
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      toast.error('Authentication error');
      router.push('/login');
    }
  }, [router]);
  
  // Fetch task data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const taskId = Array.isArray(id) ? id[0] : id;
      
      setLoading(true);
      try {
        // Fetch task details
        const taskData = await getTaskById(taskId);
        setTask(taskData);
        
        // Fetch associated project data if task has a project
        if (taskData.ProjectId) {
          try {
            const [projectData, membersData, teamsData] = await Promise.all([
              getProjectById(taskData.ProjectId),
              getProjectMembers(taskData.ProjectId),
              getProjectTeams(taskData.ProjectId)
            ]);
            
            setProject(projectData);
            setProjectMembers(membersData || []);
            setProjectTeams(teamsData || []);
            
            console.log('[TaskDetailPage] Project data loaded:', {
              projectId: projectData.Id,
              ownerId: projectData.OwnerId,
              userId
            });
          } catch (projectError) {
            console.error('Error fetching project data:', projectError);
            // Continue with task data even if project data fails
          }
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
    
    if (userId) {
      fetchData();
    }
  }, [id, userId, router]);
  
  // Determine permissions with simplified checks
  const isProjectOwner = userId && project?.OwnerId === userId;
  
  // Log permissions for debugging
  useEffect(() => {
    if (project) {
      console.log('[TaskDetailPage] Permission check:', {
        userId,
        projectOwnerId: project.OwnerId,
        isProjectOwner
      });
    }
  }, [project, userId, isProjectOwner]);
  
  // All permissions derive from project ownership
  const canEditTask = isProjectOwner;
  const canCompleteTask = isProjectOwner && !task?.Completed;
  const canDeleteTask = isProjectOwner;
  
  // Handle mark task as complete
  const handleCompleteTask = async () => {
    if (!task?.Id) return;
    
    setProcessingAction('completing');
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
      setProcessingAction(null);
    }
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    if (!task?.Id) return;
    
    setProcessingAction('deleting');
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
      setProcessingAction(null);
      setConfirmDelete(false);
    }
  };
  
  // Handle edit task success
  const handleEditSuccess = (updatedData) => {
    // Update local state with new data
    setTask(prev => ({
      ...prev,
      ...updatedData
    }));
    
    setIsEditDialogOpen(false);
    toast.success('Task updated successfully');
  };
  
  // Get creator name
  const getCreatorName = () => {
    if (!task?.CreatedBy) return 'Unknown';
    
    // If current user is the creator
    if (userId && task.CreatedBy === userId) {
      return 'You';
    }
    
    // Try to find creator in project members
    const creator = projectMembers.find(member => 
      member.UserId === task.CreatedBy || 
      member.User?.Id === task.CreatedBy
    );
    
    if (creator?.User?.FirstName) {
      return `${creator.User.FirstName} ${creator.User.LastName || ''}`;
    }
    
    return 'Another user';
  };
  
  // Get assigned user/team name
  const getAssignedName = () => {
    if (task?.TeamId) {
      const team = projectTeams.find(team => team.Id === task.TeamId);
      return team?.Name || 'Team';
    } else if (task?.UserId) {
      // If current user is assigned
      if (userId && task.UserId === userId) {
        return 'You';
      }
      
      const user = projectMembers.find(member => 
        member.UserId === task.UserId || 
        member.User?.Id === task.UserId
      );
      
      if (user?.User?.FirstName) {
        return `${user.User.FirstName} ${user.User.LastName || ''}`;
      }
      
      return 'User';
    }
    
    return 'Not assigned';
  };
  
  // Get status styles
  const getStatusStyles = () => {
    if (task?.Completed) {
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm';
    }
    
    switch (task?.Status) {
      case 'In Progress':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm';
    }
  };
  
  // Get priority styles
  const getPriorityStyles = () => {
    switch (task?.Priority) {
      case 'HIGH':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm';
      case 'MEDIUM':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm';
      case 'LOW':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm';
    }
  };
  
  // Get tab icon
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'hierarchy':
        return <ListTree className="h-4 w-4" />;
      case 'details':
        return <FileText className="h-4 w-4" />;
      case 'attachments':
        return <Paperclip className="h-4 w-4" />;
      default:
        return null;
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

  // Check if task has a valid projectId before rendering TaskTreeView
  const hasValidProjectId = task.ProjectId && task.ProjectId !== 'undefined' && task.ProjectId !== '';

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center mb-2">
          <button
            onClick={() => router.back()}
            className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="text-sm font-medium text-muted-foreground">
            {project?.Name && (
              <span className="hover:text-foreground transition-colors cursor-pointer" onClick={() => router.push(`/projects/${project.Id}`)}>
                {project.Name}
              </span>
            )}
          </div>
        </div>
        
        {/* Task Title and Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{task.Title}</h1>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusStyles()}`}>
              {task.Completed ? 'Completed' : task.Status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityStyles()}`}>
              {task.Priority} Priority
            </span>
          </div>
        </div>
        
        {/* Created By and Assignment */}
        <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Created by {getCreatorName()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {task.TeamId ? (
              <Users className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span>Assigned to {getAssignedName()}</span>
          </div>
          
          {task.Deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Due {format(parseISO(task.Deadline), 'MMMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Content (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center px-2 border-b">
            {['hierarchy', 'details', 'attachments'].map(tab => (
              <button
                key={tab}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors",
                  activeTab === tab 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab(tab)}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
                
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'hierarchy' && (
              <motion.div
                key="hierarchy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {hasValidProjectId ? (
                  <TaskTreeView
                    taskId={task.Id}
                    projectId={task.ProjectId}
                    isProjectOwner={isProjectOwner}
                    userId={userId}
                  />
                ) : (
                  <div className="bg-card rounded-xl border p-6 text-center">
                    <ListTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Task Hierarchy Available</h3>
                    <p className="text-muted-foreground mb-4">
                      This task is not associated with a project, so no task hierarchy is available.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Description
                    </h2>
                    
                    {/* Only show edit button if user is project owner */}
                    {canEditTask && (
                      <button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="p-6">
                    {task.Description ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{task.Description}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">No description provided</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assignment */}
                  <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-muted/30">
                      <h2 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Assigned To
                      </h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {task.TeamId ? (
                            <Users className="h-5 w-5 text-primary" />
                          ) : task.UserId ? (
                            <User className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{getAssignedName()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.TeamId ? 'Team' : task.UserId ? 'User' : 'Unassigned'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Created By */}
                  <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-muted/30">
                      <h2 className="font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Created By
                      </h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{getCreatorName()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.CreatedAt && format(parseISO(task.CreatedAt), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'attachments' && (
              <motion.div
                key="attachments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-xl border shadow-sm overflow-hidden p-6"
              >
                {hasValidProjectId ? (
                  <TaskAttachments 
                    taskId={task.Id}
                    projectId={task.ProjectId} 
                    isOwner={isProjectOwner} 
                  />
                ) : (
                  <div className="text-center py-8">
                    <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Attachments Available</h3>
                    <p className="text-muted-foreground">
                      This task is not associated with a project, so attachments are not available.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex flex-col gap-2">
              {canCompleteTask && !task.Completed && (
                <button
                  onClick={handleCompleteTask}
                  disabled={processingAction === 'completing'}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-sm transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  {processingAction === 'completing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Mark as Complete
                </button>
              )}
              
              {/* Only show edit/delete buttons if user is project owner */}
              {canEditTask && (
                <>
                  <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary text-primary-foreground rounded-lg shadow-sm transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Task
                  </button>
                  
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={processingAction === 'deleting'}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-sm transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    {processingAction === 'deleting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete Task
                  </button>
                </>
              )}
            </div>
          </motion.div>
          
          {/* Project Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Project
              </h2>
            </div>
            
            <div className="p-6">
              {project ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">{project.Name}</h3>
                  </div>
                  
                  {project.Description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {project.Description}
                    </p>
                  )}
                  
                  <button
                    onClick={() => router.push(`/projects/${project.Id}`)}
                    className="text-primary text-sm font-medium hover:underline flex items-center gap-1.5"
                  >
                    View Project Details
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  This task is not associated with any project.
                </p>
              )}
            </div>
          </motion.div>
          
          {/* Deadline Card */}
          {task.Deadline && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-card rounded-xl border shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Deadline
                </h2>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/5 mb-3">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  
                  <p className="text-xl font-semibold">
                    {format(parseISO(task.Deadline), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Status & Priority Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Status & Priority
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <span className={`inline-block px-4 py-2 rounded-md text-sm font-medium ${getStatusStyles()}`}>
                  {task.Completed ? 'Completed' : task.Status}
                </span>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
                <span className={`inline-block px-4 py-2 rounded-md text-sm font-medium ${getPriorityStyles()}`}>
                  {task.Priority} Priority
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Task Edit Dialog */}
      {isEditDialogOpen && (
        <TaskDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          projectId={task.ProjectId}
          task={task}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border shadow-lg max-w-md w-full p-6"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Delete Task</h3>
            <p className="text-muted-foreground text-center mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                disabled={processingAction === 'deleting'}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={processingAction === 'deleting'}
              >
                {processingAction === 'deleting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Task</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}