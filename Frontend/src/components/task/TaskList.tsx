// src/components/task/TaskList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AlertCircle, Filter, Loader2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { updateTask, markTaskComplete, deleteTask } from '@/api/TaskAPI';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils'; 

interface TaskListProps {
  tasks: any[];
  userRole: string;
  currentUserId: string;
  projectId?: string;
  loading?: boolean;
  error?: string | null;
  showProjectInfo?: boolean;
  onTasksChange?: () => void;
  viewMode?: 'list' | 'kanban';
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
  viewMode = 'list'
}: TaskListProps) {
  const router = useRouter();
  const [processingTasks, setProcessingTasks] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [columns, setColumns] = useState({
    'Not Started': [],
    'In Progress': [],
    'Completed': []
  });

  // Initialize columns when tasks change
  useEffect(() => {
    if (viewMode === 'kanban') {
      const newColumns = {
        'Not Started': tasks.filter(t => !t.Completed && t.Status === 'Not Started'),
        'In Progress': tasks.filter(t => !t.Completed && t.Status === 'In Progress'),
        'Completed': tasks.filter(t => t.Completed || t.Status === 'Completed')
      };
      setColumns(newColumns);
    }
  }, [tasks, viewMode]);

  // Handle drag end
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // If dropped in the same column and same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Get the task being moved
    const task = tasks.find(t => t.Id === draggableId);
    if (!task) return;
    
    // Update local state first for immediate feedback
    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = source.droppableId === destination.droppableId 
      ? sourceColumn 
      : [...columns[destination.droppableId]];
    
    // Remove task from source column
    const [removed] = sourceColumn.splice(source.index, 1);
    
    // Add task to destination column
    destColumn.splice(destination.index, 0, removed);
    
    // Update columns state
    const newColumns = {
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn
    };
    
    setColumns(newColumns);
    
    // Update task status in the backend
    if (source.droppableId !== destination.droppableId) {
      setProcessingTasks(prev => ({ ...prev, [task.Id]: 'updating' }));
      
      let newStatus = destination.droppableId;
      let completed = newStatus === 'Completed';
      
      try {
        if (completed) {
          await markTaskComplete(task.Id);
        } else {
          await updateTask(task.Id, { Status: newStatus });
        }
        
        toast.success(`Task moved to ${newStatus}`);
        
        // Refresh the task list if callback is provided
        if (onTasksChange) {
          onTasksChange();
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
        toast.error('Could not update task status');
        
        // Revert the change in the UI
        setColumns({
          ...columns,
          [source.droppableId]: [...columns[source.droppableId], task],
          [destination.droppableId]: columns[destination.droppableId].filter(t => t.Id !== task.Id)
        });
      } finally {
        setProcessingTasks(prev => {
          const updated = { ...prev };
          delete updated[task.Id];
          return updated;
        });
      }
    }
  };

  // Handle task completion
  const handleCompleteTask = async (taskId) => {
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

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
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
        {(userRole === 'project_owner' || userRole === 'Project Owner') && projectId && (
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

  // Kanban board view
  if (viewMode === 'kanban') {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(columns).map(columnId => (
            <div key={columnId} className="bg-card/40 backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden">
              <div className={cn(
                "p-4 border-b font-medium",
                columnId === 'Not Started' && "bg-slate-100 dark:bg-slate-800/30",
                columnId === 'In Progress' && "bg-blue-50 dark:bg-blue-900/20",
                columnId === 'Completed' && "bg-green-50 dark:bg-green-900/20"
              )}>
                <div className="flex justify-between items-center">
                  <h3>{columnId}</h3>
                  <span className="text-xs bg-background rounded-full px-2 py-1">
                    {columns[columnId].length}
                  </span>
                </div>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="p-4 min-h-[200px]"
                  >
                    <AnimatePresence>
                      {columns[columnId].map((task, index) => (
                        <Draggable 
                          key={task.Id} 
                          draggableId={task.Id} 
                          index={index}
                          isDragDisabled={!!processingTasks[task.Id]}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                            >
                              <TaskCard
                                task={task}
                                onClick={() => router.push(`/tasks/${task.Id}`)}
                                onComplete={() => handleCompleteTask(task.Id)}
                                onEdit={() => router.push(`/tasks/${task.Id}/edit`)}
                                onDelete={() => setConfirmDelete(task.Id)}
                                userRole={userRole}
                                currentUserId={currentUserId}
                                showProjectInfo={showProjectInfo}
                                className={processingTasks[task.Id] ? 'opacity-70 pointer-events-none' : ''}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg"
            >
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
            </motion.div>
          </div>
        )}
      </DragDropContext>
    );
  }

  // List view
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
                !processingTasks[task.Id] && !task.Completed
                  ? () => handleCompleteTask(task.Id)
                  : undefined
              }
              onEdit={
                !processingTasks[task.Id] && 
                (userRole === 'project_owner' || userRole === 'Project Owner')
                  ? () => router.push(`/tasks/${task.Id}/edit`)
                  : undefined
              }
              onDelete={
                !processingTasks[task.Id] && 
                (userRole === 'project_owner' || userRole === 'Project Owner')
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg"
          >
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
          </motion.div>
        </div>
      )}
    </div>
  );
}