// src/components/task/TaskTreeView.tsx - Fixed Version
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ListTree, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { TaskTreeItem } from './TaskTreeItem';
import { TaskTree, getTaskTree, markTaskComplete, deleteTaskFromTree } from '@/api/TaskTreeAPI';
import { TaskDialog } from './TaskDialog';
import { getProjectById, getProjectMembers, getProjectTeams } from '@/api/ProjectAPI';
import { getCurrentUser } from '@/api/UserAPI'; // Keep original import

interface TaskTreeViewProps {
  taskId: string;
  projectId: string;
  isProjectOwner: boolean;
  userId: string | null;
}

export function TaskTreeView({
  taskId,
  projectId,
  isProjectOwner: initialOwnerStatus,
  userId
}: TaskTreeViewProps) {
  const router = useRouter();
  
  // States
  const [taskTree, setTaskTree] = useState<TaskTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskTree | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [projectTeams, setProjectTeams] = useState<any[]>([]);
  const [project, setProject] = useState<any | null>(null);
  
  // Fetch project and task data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate IDs before making API calls
      if (!projectId || projectId === 'undefined') {
        throw new Error('Invalid or missing project ID');
      }
      
      if (!taskId || taskId === 'undefined') {
        throw new Error('Invalid or missing task ID');
      }
      
      // Get project data first to determine ownership
      const projectData = await getProjectById(projectId);
      setProject(projectData);
      
      // Fetch members and teams
      const [membersData, teamsData] = await Promise.all([
        getProjectMembers(projectId),
        getProjectTeams(projectId)
      ]);
      
      setProjectMembers(membersData || []);
      setProjectTeams(teamsData || []);
      
      // Then get the task tree
      const tree = await getTaskTree(taskId);
      setTaskTree(tree);
    } catch (err: any) {
      console.error('Failed to fetch task tree:', err);
      setError(err?.message || 'Failed to load task hierarchy');
      toast.error('Could not load task hierarchy');
      
      // If error is due to invalid project ID, notify but don't redirect from here
      // Leaving redirection to parent components
      if (err?.message?.includes('Invalid or missing project ID')) {
        setError('Invalid project ID. Please check the task details.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch initial data
  useEffect(() => {
    // Check if we have both valid projectId and taskId before fetching
    if (projectId && projectId !== 'undefined' && taskId && taskId !== 'undefined') {
      fetchAllData();
    } else {
      setError(projectId ? 'Invalid task ID' : 'Invalid project ID');
      setLoading(false);
    }
  }, [taskId, projectId, userId]);
  
  // Handle complete task
  const handleCompleteTask = async (taskId: string) => {
    try {
      await markTaskComplete(taskId);
      toast.success('Task marked as complete');
      fetchAllData();
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    }
  };
  
  // Handle edit task
  const handleEditTask = (task: TaskTree) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  // Handle add subtask
  const handleAddSubtask = (parentId: string) => {
    const parentTask = findTask(taskTree, parentId);
    
    if (parentTask) {
      setSelectedTask({
        Id: '',
        Title: '',
        Description: '',
        Status: 'Not Started',
        Priority: 'MEDIUM',
        ParentTaskId: parentId,
        ProjectId: projectId,
        CreatedBy: userId || '',
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        Completed: false,
        IsDeleted: false,
        Progress: 0,
        SubtaskCount: 0,
        SubtaskCompleted: 0,
        Subtasks: []
      });
      setIsTaskDialogOpen(true);
    }
  };
  
  // Helper function to find a task in the tree
  const findTask = (root: TaskTree | null, id: string): TaskTree | null => {
    if (!root) return null;
    if (root.Id === id) return root;
    
    if (root.Subtasks) {
      for (const subtask of root.Subtasks) {
        const found = findTask(subtask, id);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskFromTree(taskId);
      toast.success('Task deleted successfully');
      
      // If deleting the main task, navigate back to the project or tasks list
      if (taskId === taskTree?.Id) {
        if (projectId && projectId !== 'undefined') {
          router.push(`/projects/${projectId}/tasks`);
        } else {
          router.push('/tasks');
        }
      } else {
        fetchAllData();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Could not delete task');
    } finally {
      setConfirmDelete(null);
    }
  };
  
  // Handle task dialog success
  const handleTaskDialogSuccess = () => {
    setIsTaskDialogOpen(false);
    fetchAllData();
  };
  
  // Check if user is assigned to a task
  const isAssignedToTask = (task: TaskTree): boolean => {
    if (!userId) return false;
    return task.UserId === userId;
  };
  
  // Get creator name for a task
  const getCreatorName = (task: TaskTree): string => {
    if (!task.CreatedBy) return 'Unknown';
    
    if (task.CreatedBy === userId) {
      return 'You';
    }
    
    // Try to find creator in project members
    const creator = projectMembers.find(
      member => member.UserId === task.CreatedBy || member.User?.Id === task.CreatedBy
    );
    
    if (creator?.User?.FirstName) {
      return `${creator.User.FirstName} ${creator.User.LastName || ''}`;
    }
    
    return 'Another user';
  };
  
  // Get assigned name for a task
  const getAssignedName = (task: TaskTree): string => {
    if (task.TeamId) {
      const team = projectTeams.find(team => team.Id === task.TeamId);
      return team?.Name || 'Team';
    } else if (task.UserId) {
      if (task.UserId === userId) {
        return 'You';
      }
      
      const user = projectMembers.find(
        member => member.UserId === task.UserId || member.User?.Id === task.UserId
      );
      
      if (user?.User?.FirstName) {
        return `${user.User.FirstName} ${user.User.LastName || ''}`;
      }
      
      return 'User';
    }
    
    return 'Not assigned';
  };
  
  // Loading state
  if (loading && !taskTree) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task hierarchy...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Error Loading Task Hierarchy</h3>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <button
          onClick={fetchAllData}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // No task state
  if (!taskTree) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ListTree className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Task Found</h3>
        <p className="mb-6 text-muted-foreground">The task you're looking for may have been deleted or moved.</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Determine if user is project owner
  const userIsProjectOwner = project ? project.OwnerId === userId : initialOwnerStatus;
  
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border bg-card shadow-sm overflow-hidden"
      >
        <div className="p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ListTree className="h-5 w-5 text-primary" />
            Task Hierarchy
          </h2>
          
          <div className="pb-4">
            <TaskTreeItem
              task={taskTree}
              isProjectOwner={userIsProjectOwner}
              isAssignedUser={isAssignedToTask(taskTree)}
              level={0}
              creatorName={getCreatorName(taskTree)}
              assignedName={getAssignedName(taskTree)}
              onComplete={handleCompleteTask}
              onEdit={handleEditTask}
              onDelete={(id) => setConfirmDelete(id)}
              onAddSubtask={handleAddSubtask}
              refreshTree={fetchAllData}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Task Dialog */}
      {isTaskDialogOpen && selectedTask && (
        <TaskDialog
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          projectId={projectId}
          task={selectedTask.Id ? selectedTask : undefined}
          parentTaskId={selectedTask.ParentTaskId}
          onSuccess={handleTaskDialogSuccess}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg relative z-10"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">Delete Task</h3>
            <p className="mb-6 text-muted-foreground text-center">
              Are you sure you want to delete this task and all its subtasks? This action cannot be undone.
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(confirmDelete)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}