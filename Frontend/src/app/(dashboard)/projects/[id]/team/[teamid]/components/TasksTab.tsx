// Frontend/src/app/(dashboard)/projects/[id]/team/[teamid]/components/TasksTab.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ClipboardList, Clock, Calendar, User, AlertCircle, CheckCircle, CircleSlash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TasksTabProps {
  tasks: any[];
  projectId: string;
  teamId: string;
  canCreateTasks: boolean;
}

export default function TasksTab({ tasks, projectId, teamId, canCreateTasks }: TasksTabProps) {
  const router = useRouter();
  
  // Function to handle task click - redirects to task detail page
  const handleTaskClick = (taskId: string) => {
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };
  
  // Function to create a new task - redirects to create task page
  const handleCreateTask = () => {
    router.push(`/projects/${projectId}/tasks/create?teamId=${teamId}`);
  };
  
  // Function to get task status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'In Progress':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'Not Started':
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };
  
  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Not Started':
        return <CircleSlash className="w-4 h-4" />;
      default:
        return <CircleSlash className="w-4 h-4" />;
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <ClipboardList className="w-5 h-5 mr-2" />
          Team Tasks
        </h3>
        
        {canCreateTasks && (
          <button 
            onClick={handleCreateTask}
            className="flex items-center text-sm px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Task
          </button>
        )}
      </div>
      
      {tasks.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <ClipboardList className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-muted-foreground">No tasks assigned to this team yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.Id} 
              onClick={() => handleTaskClick(task.Id)}
              className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{task.Title}</h4>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full flex items-center gap-1",
                  getStatusBadge(task.Status)
                )}>
                  {getStatusIcon(task.Status)}
                  {task.Status || 'Not Started'}
                </span>
              </div>
              
              {task.Description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.Description}</p>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                {task.Deadline && (
                  <div className="flex items-center mr-4">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(task.Deadline).toLocaleDateString()}
                  </div>
                )}
                
                {task.UserId && (
                  <div className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    {task.AssignedUserName || 'Assigned'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}