// src/components/task/TaskSidebar.tsx
'use client';

import { motion } from 'framer-motion';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { 
  Briefcase, 
  ExternalLink, 
  CheckCircle, 
  Loader2, 
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface TaskSidebarProps {
  task: any;
  project: any;
  canCompleteTask: boolean;
  onComplete: () => void;
  processingAction: string | null;
}

export function TaskSidebar({
  task,
  project,
  canCompleteTask,
  onComplete,
  processingAction
}: TaskSidebarProps) {
  
  // Get deadline status
  const getDeadlineStatusColor = () => {
    if (!task.Deadline) return null;
    
    try {
      const deadline = parseISO(task.Deadline);
      
      if (task.Completed) {
        return 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      }
      
      if (isPast(deadline) && !isToday(deadline)) {
        return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      }
      
      if (isToday(deadline)) {
        return 'bg-amber-100 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      }
      
      return 'bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    } catch (e) {
      return 'bg-muted border-muted-foreground/20';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 dark:text-red-400';
      case 'MEDIUM':
        return 'text-amber-600 dark:text-amber-400';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };
  
  // Format deadline display
  const formatDeadline = () => {
    if (!task.Deadline) return null;
    
    try {
      const deadline = parseISO(task.Deadline);
      let status = '';
      
      if (task.Completed) {
        status = 'Completed';
      } else if (isPast(deadline) && !isToday(deadline)) {
        status = 'Overdue';
      } else if (isToday(deadline)) {
        status = 'Due today';
      } else {
        const days = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        status = `Due in ${days} day${days !== 1 ? 's' : ''}`;
      }
      
      return {
        date: format(deadline, 'MMMM d, yyyy'),
        status
      };
    } catch (e) {
      return {
        date: 'Invalid date',
        status: ''
      };
    }
  };
  
  const deadlineFormatted = formatDeadline();
  const deadlineStatusColor = getDeadlineStatusColor();
  const priorityColor = getPriorityColor(task.Priority);

  return (
    <>
      {/* Project Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border shadow-sm overflow-hidden bg-card"
      >
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Project
          </h2>
        </div>
        
        <div className="p-4">
          {project ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Project Name</h3>
                <p className="font-medium">{project.Name}</p>
              </div>
              
              {project.Description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p className="text-sm line-clamp-3">{project.Description}</p>
                </div>
              )}
              
              <Link
                href={`/projects/${project.Id}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Project</span>
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground">Project information not available</p>
          )}
        </div>
      </motion.div>
      
      {/* Deadline Card */}
      {task.Deadline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`rounded-xl border shadow-sm overflow-hidden ${deadlineStatusColor}`}
        >
          <div className="p-4 border-b border-white/10 bg-white/10 dark:bg-black/10">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deadline
            </h2>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              <div className="text-center py-2">
                <p className="text-2xl font-bold">{deadlineFormatted?.date}</p>
                <p className={`text-sm mt-1 ${
                  task.Completed 
                    ? 'text-green-600 dark:text-green-400' 
                    : isPast(parseISO(task.Deadline)) && !isToday(parseISO(task.Deadline))
                    ? 'text-red-600 dark:text-red-400'
                    : isToday(parseISO(task.Deadline))
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {deadlineFormatted?.status}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Task Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-xl border shadow-sm overflow-hidden bg-card"
      >
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Task Status
          </h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h3>
              <div className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex ${
                task.Completed
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : task.Status === 'In Progress'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {task.Completed ? 'Completed' : task.Status || 'Not Started'}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
              <div className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center ${
                task.Priority === 'HIGH'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : task.Priority === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${priorityColor}`}></span>
                {task.Priority} Priority
              </div>
            </div>
            
            {canCompleteTask && !task.Completed && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                disabled={processingAction === 'completing'}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 shadow-sm font-medium"
              >
                {processingAction === 'completing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark as Complete</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}