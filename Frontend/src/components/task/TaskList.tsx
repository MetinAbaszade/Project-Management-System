'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Filter, Loader2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { deleteTask, markTaskComplete, updateTask } from '@/api/TaskAPI';
import { toast } from '@/lib/toast';

interface TaskListProps {
  tasks: any[];
  userRole: string;
  currentUserId: string;
  projectId?: string;
  loading?: boolean;
  error?: string | null;
  showProjectInfo?: boolean;
  onTasksChange?: () => void;
}

export function TaskList({
  tasks,
  userRole,
  currentUserId,
  projectId,
  loading = false,
  error = null,
  showProjectInfo = false,
  onTasksChange,
}: TaskListProps) {
  const router = useRouter();
  const [processingTasks, setProcessingTasks] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Check if user has permission to perform certain actions
  const isProjectOwner = userRole === 'project_owner' || userRole === 'Project Owner';
  const isTeamLeader = userRole === 'team_leader' || userRole === 'Team Leader';
  
  // Handle mark task as complete
  const handleCompleteTask = async (taskId: string) => {
    if (processingTasks[taskId]) return;
    
    setProcessingTasks(prev => ({ ...prev, [taskId]: 'completing' }));
    
    try {
      await markTaskComplete(taskId);
      
      toast.success('Task marked as complete');
      
      // Refresh the task list if callback is provided
      if (onTasksChange) {
        onTasksChange();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    } finally {
      setProcessingTasks(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
    }
  };

  // Handle edit task
  const handleEditTask = (taskId: string) => {
    router.push(`/tasks/${taskId}/edit`);
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    if (processingTasks[taskId]) return;
    
    setProcessingTasks(prev => ({ ...prev, [taskId]: 'deleting' }));
    
    try {
      await deleteTask(taskId);
      
      toast.success('Task deleted successfully');
      
      // Refresh the task list if callback is provided
      if (onTasksChange) {
        onTasksChange();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Could not delete task');
    } finally {
      setProcessingTasks(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
      
      setConfirmDelete(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Error Loading Tasks</h3>
        <p className="mb-6 text-muted-foreground">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Filter className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Tasks Found</h3>
        <p className="mb-6 text-muted-foreground">
          {showProjectInfo
            ? "You don't have any tasks assigned to you yet."
            : "This project doesn't have any tasks yet."}
        </p>
        {(isProjectOwner || isTeamLeader) && projectId && (
          <button
            onClick={() => router.push(`/projects/${projectId}/tasks/create`)}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.Id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <TaskCard
              task={task}
              onClick={() => router.push(`/tasks/${task.Id}`)}
              onComplete={
                // Only show if not being processed and user has permission
                !processingTasks[task.Id] &&
                (isProjectOwner || isTeamLeader || currentUserId === task.UserId) &&
                !task.Completed
                  ? () => handleCompleteTask(task.Id)
                  : undefined
              }
              onEdit={
                // Only show to project owners and team leaders
                !processingTasks[task.Id] && (isProjectOwner || isTeamLeader)
                  ? () => handleEditTask(task.Id)
                  : undefined
              }
              onDelete={
                // Only show to project owners and team leaders
                !processingTasks[task.Id] && (isProjectOwner || isTeamLeader)
                  ? () => setConfirmDelete(task.Id)
                  : undefined
              }
              userRole={userRole}
              currentUserId={currentUserId}
              showProjectInfo={showProjectInfo}
              className={processingTasks[task.Id] ? 'opacity-70 pointer-events-none' : ''}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Delete Task</h3>
            <p className="mb-6 text-muted-foreground">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
                disabled={processingTasks[confirmDelete] === 'deleting'}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(confirmDelete)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                disabled={processingTasks[confirmDelete] === 'deleting'}
              >
                {processingTasks[confirmDelete] === 'deleting' ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}