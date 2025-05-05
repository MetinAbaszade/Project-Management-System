import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const ProjectCard = ({ project, index, onProjectClick, onMenuClick }) => {
  const { name, progress, deadline, status, description, teams } = project;
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Completed': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'On Hold': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Not Started': 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onProjectClick(project)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400">
            {name}
          </h3>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
            <button 
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(project, e);
              }}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 h-10 overflow-hidden">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Due {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs font-medium">
            {progress}% Complete
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
          <div 
            className="bg-blue-500 h-1.5 rounded-full animate-grow-width" 
            style={{ width: `${progress}%`, animationDelay: `${(index * 100) + 300}ms` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">{teams} teams</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">{project.tasks || 0} tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;