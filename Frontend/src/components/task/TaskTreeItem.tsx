// src/components/task/TaskTreeItem.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Edit, 
  Trash2,
  Plus,
  User,
  Clock,
  AlarmClock,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { TaskTree } from '@/api/TaskTreeAPI';

interface TaskTreeItemProps {
  task: TaskTree;
  isProjectOwner: boolean;
  isAssignedUser: boolean;
  level: number;
  creatorName: string;
  assignedName: string;
  onComplete: (taskId: string) => void;
  onEdit: (task: TaskTree) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (parentId: string) => void;
  refreshTree: () => void;
}

export function TaskTreeItem({
  task,
  isProjectOwner,
  isAssignedUser,
  level,
  creatorName,
  assignedName,
  onComplete,
  onEdit,
  onDelete,
  onAddSubtask,
  refreshTree
}: TaskTreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  
  const hasSubtasks = task.Subtasks && task.Subtasks.length > 0;
  const canComplete = isProjectOwner || isAssignedUser;
  
  // Calculate if task is overdue
  const isOverdue = () => {
    if (!task.Deadline || task.Completed) return false;
    try {
      const deadline = parseISO(task.Deadline);
      return isPast(deadline) && !isToday(deadline);
    } catch (e) {
      return false;
    }
  };
  
  // Calculate if task is due today
  const isDueToday = () => {
    if (!task.Deadline || task.Completed) return false;
    try {
      const deadline = parseISO(task.Deadline);
      return isToday(deadline);
    } catch (e) {
      return false;
    }
  };
  
  // Get priority styling
  const getPriorityStyles = () => {
    switch (task.Priority) {
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
  
  // Get status styling
  const getStatusStyles = () => {
    if (task.Completed) {
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    }
    
    switch (task.Status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Not Started':
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  // Format deadline for display
  const formatDeadline = () => {
    if (!task.Deadline) return null;
    
    try {
      return format(parseISO(task.Deadline), 'MMM d, yyyy');
    } catch (e) {
      return null;
    }
  };
  
  return (
    <div className={cn(
      "border-l-2 pl-4 my-3",
      level === 0 ? "border-transparent" : "border-primary/20",
      task.Completed && "opacity-70"
    )}>
      <div className={cn(
        "rounded-lg border transition-all duration-200 hover:shadow-md",
        task.Completed ? "bg-card/60" : "bg-card",
        isOverdue() && "border-red-300 dark:border-red-700"
      )}>
        <div className="p-4">
          {/* Task Header - Title and Toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {hasSubtasks && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}
              
              <h3 className={cn(
                "font-medium",
                task.Completed && "line-through"
              )}>
                {task.Title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                getStatusStyles()
              )}>
                {task.Completed ? 'Completed' : task.Status}
              </span>
              
              {/* Priority Badge */}
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                getPriorityStyles()
              )}>
                {task.Priority} Priority
              </span>
            </div>
          </div>
          
          {/* Task Details - Progress, Deadline, etc. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {/* Progress Bar */}
            <div className="flex flex-col">
              <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                <span>Progress</span>
                <span>{task.Progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    task.Completed ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${task.Progress}%` }}
                />
              </div>
            </div>
            
            {/* Subtask Count */}
            <div className="flex items-center text-xs text-muted-foreground gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {task.SubtaskCompleted} of {task.SubtaskCount} subtasks completed
              </span>
            </div>
            
            {/* Deadline */}
            {task.Deadline && (
              <div className={cn(
                "flex items-center text-xs gap-2",
                isOverdue() ? "text-red-500" : isDueToday() ? "text-amber-500" : "text-muted-foreground"
              )}>
                {isOverdue() ? (
                  <AlarmClock className="h-3.5 w-3.5" />
                ) : (
                  <Calendar className="h-3.5 w-3.5" />
                )}
                <span>
                  {isOverdue() ? 'Overdue: ' : isDueToday() ? 'Due today: ' : 'Due: '}
                  {formatDeadline()}
                </span>
              </div>
            )}
          </div>
          
          {/* Task Actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            {/* Creator and Assigned User */}
            <div className="flex flex-col gap-0.5">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Created by {creatorName}</span>
              </div>
              
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Assigned to {assignedName}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isProjectOwner && (
                <>
                  <button
                    onClick={() => onAddSubtask(task.Id)}
                    className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
                    title="Add subtask"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1.5 rounded-full hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                    title="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => onDelete(task.Id)}
                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              
              {canComplete && !task.Completed && (
                <button
                  onClick={() => onComplete(task.Id)}
                  className="p-1.5 rounded-full hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 transition-colors"
                  title="Mark as complete"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtasks */}
      <AnimatePresence>
        {expanded && hasSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-4"
          >
            {task.Subtasks.map(subtask => (
              <TaskTreeItem
                key={subtask.Id}
                task={subtask}
                isProjectOwner={isProjectOwner}
                isAssignedUser={isAssignedUser}
                level={level + 1}
                creatorName={creatorName}
                assignedName={assignedName}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                refreshTree={refreshTree}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}