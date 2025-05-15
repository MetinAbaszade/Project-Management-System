// Fixed task detail page
// Key changes:
// 1. Fixed getTaskAttachments call to pass projectId
// 2. Improved error handling
// 3. Added null checks

'use client';

import { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  FileText,
  Paperclip,
  Upload,
  X,
  Loader2,
  MoreHorizontal,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';

// API imports
import { 
  getTaskById, 
  updateTask, 
  deleteTask, 
  markTaskComplete,
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment 
} from '@/api/TaskAPI';
import { getProjectById } from '@/api/ProjectAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// CSS for the page
import './taskDetail.css';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    Title: '',
    Description: '',
    Priority: '',
    Status: '',
    Deadline: '',
    UserId: '',
    TeamId: '',
    Cost: 0
  });
  const [saving, setSaving] = useState(false);
  
  // Permissions
  const [permissions, setPermissions] = useState({
    isProjectOwner: false,
    isTeamLeader: false,
    isAssignedUser: false,
    canEdit: false,
    canDelete: false,
    canComplete: false,
    canUpload: false
  });

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
        
        // Initialize edit form
        setEditForm({
          Title: taskData.Title || '',
          Description: taskData.Description || '',
          Priority: taskData.Priority || 'MEDIUM',
          Status: taskData.Status || 'Not Started',
          Deadline: taskData.Deadline ? taskData.Deadline.split('T')[0] : '',
          UserId: taskData.UserId || '',
          TeamId: taskData.TeamId || '',
          Cost: taskData.Cost || 0
        });
        
        // Fetch associated project
        if (taskData.ProjectId) {
          const projectData = await getProjectById(taskData.ProjectId);
          setProject(projectData);
          
          // Determine user permissions
          const isOwner = projectData.OwnerId === userId;
          
          // Check if user is team leader
          let isLeader = false;
          if (taskData.TeamId && projectData.teams) {
            const team = projectData.teams.find((t: any) => t.Id === taskData.TeamId);
            isLeader = team?.LeaderId === userId;
          }
          
          // Check if user is assigned to this task
          const isAssigned = taskData.UserId === userId;
          
          // Set permissions
          setPermissions({
            isProjectOwner: isOwner,
            isTeamLeader: isLeader,
            isAssignedUser: isAssigned,
            canEdit: isOwner || isLeader,
            canDelete: isOwner || isLeader,
            canComplete: isOwner || isLeader || isAssigned,
            canUpload: isOwner || isLeader || isAssigned
          });
          
          // Fetch attachments - Now passing the projectId as needed
          try {
            const attachmentsData = await getTaskAttachments(id as string, taskData.ProjectId);
            setAttachments(attachmentsData || []);
          } catch (attachmentError) {
            console.error('Error fetching attachments:', attachmentError);
            // Don't fail the whole page load if attachments fail
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
    
    fetchData();
  }, [id, userId, router]);
  
  // Handle attachment upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task?.Id || !task?.ProjectId) {
      toast.error('Missing task information for file upload');
      return;
    }
    
    setUploading(true);
    try {
      // Pass both taskId and projectId to the upload function
      const newAttachment = await uploadTaskAttachment(file, task.Id, task.ProjectId);
      setAttachments(prev => [...prev, newAttachment]);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Could not upload file');
    } finally {
      setUploading(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task?.Id) return;
    
    try {
      await deleteTaskAttachment(task.Id, attachmentId);
      
      // Update state
      setAttachments(prev => prev.filter(att => att.Id !== attachmentId));
      
      toast.success('File deleted');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Could not delete file');
    }
  };
  
  // Handle edit form submission
  const handleSaveEdit = async () => {
    if (!task?.Id) return;
    
    setSaving(true);
    try {
      // Prepare update data
      const updateData: any = { ...editForm };
      
      // Convert deadline to ISO format if present
      if (updateData.Deadline) {
        updateData.Deadline = new Date(updateData.Deadline).toISOString();
      }
      
      // Remove empty values to avoid overwriting with nulls
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      // Update task
      const updatedTask = await updateTask(task.Id, updateData);
      
      // Update local state
      setTask(updatedTask);
      setIsEditing(false);
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Could not update task');
    } finally {
      setSaving(false);
    }
  };
  
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
      setDeleteConfirmOpen(false);
    }
  };
  
  // Helper for priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'var(--destructive)';
      case 'MEDIUM': return 'var(--warning)';
      case 'LOW': return 'var(--success)';
      default: return 'var(--muted-foreground)';
    }
  };

  // Helper for deadline status
  const getDeadlineStatus = () => {
    if (!task?.Deadline) return null;
    
    try {
      const deadline = parseISO(task.Deadline);
      
      if (task.Completed) {
        return { label: 'Task completed', color: 'text-success' };
      }
      
      if (isPast(deadline) && !isToday(deadline)) {
        return { label: 'Overdue', color: 'text-destructive' };
      }
      
      if (isToday(deadline)) {
        return { label: 'Due today', color: 'text-warning' };
      }
      
      return null;
    } catch (e) {
      console.error('Invalid date format:', e);
      return null;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="task-detail-container flex items-center justify-center min-h-[60vh]">
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
      <div className="task-detail-container flex items-center justify-center min-h-[60vh]">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center space-y-4 border shadow-sm">
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Deadline status
  const deadlineStatus = getDeadlineStatus();

  return (
    <div className="task-detail-container">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          {!task.Completed && permissions.canComplete && (
            <button
              onClick={handleCompleteTask}
              disabled={completing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors disabled:opacity-70"
            >
              {completing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark Complete
            </button>
          )}
          
          {permissions.canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
          
          {permissions.canDelete && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>
      
      {/* Task Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Task Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            {isEditing ? (
              /* Edit Form */
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold">Edit Task</h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <label htmlFor="edit-title" className="block text-sm font-medium">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <input 
                      id="edit-title"
                      type="text"
                      value={editForm.Title}
                      onChange={(e) => setEditForm({ ...editForm, Title: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <label htmlFor="edit-description" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea 
                      id="edit-description"
                      value={editForm.Description || ''}
                      onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  
                  {/* Priority and Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="edit-priority" className="block text-sm font-medium">
                        Priority
                      </label>
                      <select 
                        id="edit-priority"
                        value={editForm.Priority}
                        onChange={(e) => setEditForm({ ...editForm, Priority: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="edit-status" className="block text-sm font-medium">
                        Status
                      </label>
                      <select 
                        id="edit-status"
                        value={editForm.Status}
                        onChange={(e) => setEditForm({ ...editForm, Status: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Deadline and Cost */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="edit-deadline" className="block text-sm font-medium">
                        Deadline
                      </label>
                      <input 
                        id="edit-deadline"
                        type="date"
                        value={editForm.Deadline || ''}
                        onChange={(e) => setEditForm({ ...editForm, Deadline: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="edit-cost" className="block text-sm font-medium">
                        Cost
                      </label>
                      <input 
                        id="edit-cost"
                        type="number"
                        value={editForm.Cost || 0}
                        onChange={(e) => setEditForm({ ...editForm, Cost: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving || !editForm.Title}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Task Details View */
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-semibold">{task.Title}</h2>
                  
                  <div className="flex gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        task.Priority === 'HIGH' && "bg-destructive/10 text-destructive",
                        task.Priority === 'MEDIUM' && "bg-warning/10 text-warning",
                        task.Priority === 'LOW' && "bg-success/10 text-success",
                      )}
                    >
                      {task.Priority} Priority
                    </span>
                    
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-full",
                        task.Status === 'Completed' || task.Completed
                          ? "bg-success/10 text-success"
                          : task.Status === 'In Progress'
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
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
                        <p className={cn("text-sm", deadlineStatus.color)}>
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
            )}
          </motion.div>
          
          {/* Attachments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments
              </h2>
              
              {permissions.canUpload && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !task.ProjectId}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </>
              )}
            </div>
            
            <div className="p-4">
              {attachments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No attachments yet</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {attachments.map((attachment) => (
                    <li key={attachment.Id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{attachment.FileName}</p>
                          {attachment.FileSize && (
                            <p className="text-xs text-muted-foreground">
                              {(attachment.FileSize / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(attachment.Url || `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.Id}/attachments/${attachment.Id}`, '_blank')}
                          className="p-1.5 hover:bg-muted rounded-md transition-colors"
                          aria-label="Download file"
                        >
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </button>
                        
                        {permissions.canUpload && (
                          <button
                            onClick={() => handleDeleteAttachment(attachment.Id)}
                            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                            aria-label="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Project Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b">
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
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-card rounded-xl border shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Task Status</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h3>
                  <div
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md inline-flex",
                      task.Status === 'Completed' || task.Completed
                        ? "bg-success/10 text-success"
                        : task.Status === 'In Progress'
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {task.Status || (task.Completed ? 'Completed' : 'Not Started')}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                  <div
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md inline-flex",
                      task.Priority === 'HIGH' && "bg-destructive/10 text-destructive",
                      task.Priority === 'MEDIUM' && "bg-warning/10 text-warning",
                      task.Priority === 'LOW' && "bg-success/10 text-success",
                    )}
                  >
                    {task.Priority} Priority
                  </div>
                </div>
                
                {!task.Completed && permissions.canComplete && (
                  <button
                    onClick={handleCompleteTask}
                    disabled={completing}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors disabled:opacity-70 mt-4"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Complete</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl border shadow-lg max-w-md w-full p-6"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-bold mb-2">Delete Task</h2>
                <p className="text-muted-foreground">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
                >
                  {deleting ? (
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
      </AnimatePresence>
    </div>
  );
}