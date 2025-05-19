// src/components/task/TaskDetailsPanel.tsx
'use client';

import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast, isToday, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertTriangle,
  Edit,
  Calendar as CalendarIcon,
  AlarmClock,
  Tag,
  Briefcase,
  DollarSign,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';
import { updateTask } from '@/api/TaskAPI';
import { toast } from '@/lib/toast';

interface TaskDetailsPanelProps {
  task: any;
  project: any;
  onUpdate: (updatedData: any) => void;
  isProjectOwner: boolean;
  userId: string | null;
  projectMembers: any[];
  projectTeams: any[];
}

export function TaskDetailsPanel({
  task,
  project,
  onUpdate,
  isProjectOwner,
  userId,
  projectMembers,
  projectTeams
}: TaskDetailsPanelProps) {
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState(task.Description || '');
  const [saving, setSaving] = useState(false);
  
  // Get creator name
  const getCreatorName = () => {
    if (task.CreatedBy === userId) return 'You';
    
    const creator = projectMembers.find(
      member => member.UserId === task.CreatedBy
    );
    
    if (creator?.User?.FirstName) {
      return `${creator.User.FirstName} ${creator.User.LastName || ''}`;
    }
    
    return 'Another user';
  };
  
  // Get assigned user/team name
  const getAssignedName = () => {
    if (task.TeamId) {
      const team = projectTeams.find(team => team.Id === task.TeamId);
      return team?.Name || 'Team';
    } else if (task.UserId) {
      if (task.UserId === userId) return 'You';
      
      const user = projectMembers.find(
        member => member.UserId === task.UserId
      );
      
      if (user?.User?.FirstName) {
        return `${user.User.FirstName} ${user.User.LastName || ''}`;
      }
      
      return 'User';
    }
    
    return 'Not assigned';
  };
  
  // Get deadline status
  const getDeadlineStatus = () => {
    if (!task.Deadline) return null;
    
    try {
      const deadline = parseISO(task.Deadline);
      
      if (task.Completed) {
        return { 
          label: 'Task completed', 
          color: 'text-green-600 dark:text-green-400',
          icon: <CheckmarkIcon className="h-4 w-4" />
        };
      }
      
      if (isPast(deadline) && !isToday(deadline)) {
        return { 
          label: 'Overdue', 
          color: 'text-red-600 dark:text-red-400',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      }
      
      if (isToday(deadline)) {
        return { 
          label: 'Due today', 
          color: 'text-amber-600 dark:text-amber-400',
          icon: <AlarmClock className="h-4 w-4" />
        };
      }
      
      return null;
    } catch (e) {
      console.error('Invalid date format:', e);
      return null;
    }
  };
  
  // Format created date with relative time
  const formatCreatedDate = () => {
    try {
      const createdDate = parseISO(task.CreatedAt);
      return `${format(createdDate, 'MMM d, yyyy')} (${formatDistanceToNow(createdDate, { addSuffix: true })})`;
    } catch (e) {
      return format(new Date(), 'MMM d, yyyy');
    }
  };
  
  // Handle save description
  const handleSaveDescription = async () => {
    setSaving(true);
    try {
      await updateTask(task.Id, { Description: description });
      onUpdate({ Description: description });
      setEditingDescription(false);
      toast.success('Description updated');
    } catch (error) {
      console.error('Failed to update description:', error);
      toast.error('Could not update description');
    } finally {
      setSaving(false);
    }
  };
  
  // Deadline status
  const deadlineStatus = getDeadlineStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl bg-card border shadow-sm overflow-hidden"
    >
      <div className="border-b bg-muted/30 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Task Details</h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Description
              </h3>
              
              {isProjectOwner && !editingDescription && (
                <button
                  onClick={() => setEditingDescription(true)}
                  className="text-xs text-primary flex items-center hover:underline"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </button>
              )}
            </div>
            
            {editingDescription ? (
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all min-h-[120px]"
                  placeholder="Enter task description..."
                ></textarea>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingDescription(false);
                      setDescription(task.Description || '');
                    }}
                    className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSaveDescription}
                    className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-4">
                {task.Description ? (
                  <p className="text-foreground whitespace-pre-wrap">{task.Description}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No description provided</p>
                )}
              </div>
            )}
          </div>
          
          {/* Task details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Assignment */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {task.TeamId ? (
                  <Users className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                Assigned To
              </h3>
              
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {task.TeamId ? (
                    <Users className="h-5 w-5 text-primary" />
                  ) : task.UserId ? (
                    <User className="h-5 w-5 text-primary" />
                  ) : (
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{getAssignedName()}</div>
                  <div className="text-xs text-muted-foreground">
                    {task.TeamId ? 'Team' : task.UserId ? 'User' : 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Creation Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created By
              </h3>
              
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{getCreatorName()}</div>
                  <div className="text-xs text-muted-foreground">{formatCreatedDate()}</div>
                </div>
              </div>
            </div>
            
            {/* Deadline */}
            {task.Deadline && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Deadline
                </h3>
                
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {format(parseISO(task.Deadline), 'MMMM d, yyyy')}
                    </div>
                    {deadlineStatus && (
                      <div className={`flex items-center gap-1 text-xs ${deadlineStatus.color}`}>
                        {deadlineStatus.icon}
                        <span>{deadlineStatus.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Cost if available */}
            {task.Cost > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost
                </h3>
                
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">${task.Cost.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Estimated cost</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Project Info */}
            {project && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Project
                </h3>
                
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{project.Name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.Description 
                        ? project.Description.substring(0, 30) + (project.Description.length > 30 ? '...' : '')
                        : 'No description'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Custom checkmark icon
function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}