// src/components/task/TaskHeader.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { TaskDialog } from './TaskDialog';

interface TaskHeaderProps {
  task: any;
  project: any;
  isProjectOwner: boolean;
  canCompleteTask: boolean;
  onBack: () => void;
  onComplete: () => void;
  onDelete: () => void;
  processingAction: string | null;
}

export function TaskHeader({
  task,
  project,
  isProjectOwner,
  canCompleteTask,
  onBack,
  onComplete,
  onDelete,
  processingAction
}: TaskHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-card/80 backdrop-blur-sm shadow-sm border overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors shrink-0 mt-1"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{task.Title}</h1>
                
                {/* Task status badge */}
                <span 
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    task.Completed 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : task.Status === 'In Progress'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {task.Completed ? 'Completed' : task.Status}
                </span>
                
                {/* Task priority badge */}
                <span 
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    task.Priority === 'HIGH'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      : task.Priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {task.Priority} Priority
                </span>
              </div>
              
              {project?.Name && (
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60"></span>
                  Project: {project.Name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {canCompleteTask && !task.Completed && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                disabled={processingAction === 'completing'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-70 shadow-sm"
              >
                {processingAction === 'completing' ? (
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
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDelete}
                  disabled={processingAction === 'deleting'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  {processingAction === 'deleting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Task Dialog */}
      <TaskDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        projectId={task.ProjectId}
        task={task}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          window.location.reload(); // Refresh to get updated data
        }}
      />
    </motion.div>
  );
}