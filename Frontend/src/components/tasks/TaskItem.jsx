import React from 'react';
import { Calendar, CheckCircle, Circle } from 'lucide-react';
import PriorityBadge from '../ui/PriorityBadge';

const TaskItem = ({ task, index, toggleTask, onTaskClick }) => {
  const { id, title, project, deadline, completed, priority, status, assignedTo } = task;
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const formattedDate = new Date(deadline).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 mb-3 border border-gray-100 dark:border-gray-700 ${
        completed ? 'opacity-70' : ''
      } hover:shadow-md cursor-pointer transition-all animate-slide-up`}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onTaskClick && onTaskClick(task)}
    >
      <div className="flex items-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(id);
          }} 
          className="flex-shrink-0 mr-3 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {completed ? 
            <CheckCircle className="w-6 h-6 text-blue-500" /> : 
            <Circle className="w-6 h-6" />
          }
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium truncate ${completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {title}
          </h3>
          <div className="flex items-center mt-1">
            <PriorityBadge priority={priority} variant="dot" size="xs" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate ml-2">{project}</span>
            
            {assignedTo && (
              <>
                <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Assigned to: {typeof assignedTo === 'string' ? assignedTo : assignedTo.name || 'Team'}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-4 space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;