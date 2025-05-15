// Improved TaskCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface TaskCardProps {
  task: {
    Id: string;
    Title: string;
    Description?: string;
    UserId?: string;
    TeamId?: string;
    Status: string;
    Priority: string;
    CreatedBy: string;
    Deadline?: string;
    Completed: boolean;
    ProjectId?: string;
  };
  onClick: () => void;
  onComplete?: (e: React.MouseEvent) => void;
  userRole?: string | null;
  currentUserId?: string;
  project?: any; // Optional project info
  showProjectInfo?: boolean;
  className?: string;
}

export function TaskCard({
  task,
  onClick,
  onComplete,
  userRole,
  currentUserId,
  project,
  showProjectInfo = false,
  className,
}: TaskCardProps) {
  const isTeamTask = !!task.TeamId;
  const isAssigned = task.UserId === currentUserId;
  const isCreator = task.CreatedBy === currentUserId;
  const canComplete = isAssigned || isCreator || userRole === 'project_owner';

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.Deadline || task.Completed) return false;
    return isPast(new Date(task.Deadline)) && !isToday(new Date(task.Deadline));
  };

  // Check if task is due today
  const isDueToday = () => {
    if (!task.Deadline || task.Completed) return false;
    return isToday(new Date(task.Deadline));
  };

  // Get priority styling
  const getPriorityStyles = () => {
    switch (task.Priority) {
      case 'HIGH':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          indicator: 'bg-red-500'
        };
      case 'MEDIUM':
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-100 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          indicator: 'bg-amber-500'
        };
      case 'LOW':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          indicator: 'bg-blue-500'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          indicator: 'bg-gray-500'
        };
    }
  };

  // Get status styling
  const getStatusStyles = () => {
    if (task.Completed) {
      return {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20'
      };
    }

    switch (task.Status) {
      case 'In Progress':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/20'
        };
      case 'Not Started':
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-800/30'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-800/30'
        };
    }
  };

  const priorityStyles = getPriorityStyles();
  const statusStyles = getStatusStyles();

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200',
        task.Completed && 'opacity-80',
        isOverdue() && !task.Completed && 'border-red-300 dark:border-red-800',
        className
      )}
    >
      {/* Priority indicator strip */}
      <div className={cn('absolute left-0 top-0 h-full w-1.5', priorityStyles.indicator)} />

      {/* Card content with padding offset for the indicator */}
      <div className="p-5 pl-4" onClick={onClick}>
        <div className="flex justify-between">
          <div className="space-y-2 pl-2">
            <h3 
              className={cn(
                "line-clamp-2 font-medium tracking-tight pr-2", 
                task.Completed && "line-through opacity-60"
              )}
            >
              {task.Title}
            </h3>
            
            {task.Description && (
              <p className={cn(
                "line-clamp-2 text-sm text-muted-foreground",
                task.Completed && "opacity-60"
              )}>
                {task.Description}
              </p>
            )}
          </div>
          
          <Badge className={cn('ml-auto shrink-0', statusStyles.bg, statusStyles.color)}>
            {task.Completed ? 'Completed' : task.Status}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pl-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {task.Deadline && (
              <div 
                className={cn(
                  "flex items-center gap-1",
                  isOverdue() && !task.Completed && "text-red-500",
                  isDueToday() && !task.Completed && "text-amber-500"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {isOverdue() && !task.Completed 
                    ? 'Overdue' 
                    : isDueToday() && !task.Completed 
                      ? 'Due today' 
                      : format(new Date(task.Deadline), 'MMM d')}
                </span>
                {isOverdue() && !task.Completed && <AlertTriangle className="h-3.5 w-3.5 ml-0.5" />}
              </div>
            )}
            
            {isTeamTask ? (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Team</span>
              </div>
            ) : task.UserId ? (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{isAssigned ? 'Assigned to you' : 'Assigned'}</span>
              </div>
            ) : null}
            
            {showProjectInfo && project && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{project.Name || project.Title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Details button */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 gap-1 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            
            {/* Complete button */}
            {!task.Completed && canComplete && onComplete && (
              <Button 
                size="icon" 
                variant="outline" 
                className={cn(
                  "h-8 w-8 rounded-full border border-green-200 bg-green-100/50 text-green-600 hover:bg-green-200 hover:text-green-700",
                  "dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40",
                  "transition-all"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(e);
                }}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shine" />
      </div>
    </motion.div>
  );
}