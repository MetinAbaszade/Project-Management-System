import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag } from 'lucide-react';

const AddTaskModal = ({ isOpen, onClose, onAddTask, projects }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [project, setProject] = useState('');
  const [assignedTo, setAssignedTo] = useState('user'); // 'user' or 'team'
  const [teamId, setTeamId] = useState('');
  const [userId, setUserId] = useState('');
  
  // If no projects are provided, use this default data
  const defaultProjects = [
    { id: '1', name: 'Website Redesign' },
    { id: '2', name: 'Mobile App Development' },
    { id: '3', name: 'Marketing Campaign' }
  ];
  
  // Use provided projects or defaults
  const projectList = projects || defaultProjects;
  
  // Mock data - these would come from your API/state
  const teams = [
    { id: '1', name: 'Design Team', color: 'blue' },
    { id: '2', name: 'Development Team', color: 'purple' },
    { id: '3', name: 'Marketing Team', color: 'green' }
  ];
  
  const users = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Sarah Miller' },
    { id: '3', name: 'Michael Chen' },
    { id: '4', name: 'Emily Wong' }
  ];
  
  // Set default date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeadline(tomorrow.toISOString().split('T')[0]);
      
      // Set default project if available
      if (projectList.length > 0) {
        setProject(projectList[0].id);
      }
      
      // Set default user
      if (users.length > 0) {
        setUserId(users[0].id);
      }
      
      // Set default team
      if (teams.length > 0) {
        setTeamId(teams[0].id);
      }
    }
  }, [isOpen, projectList]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !project || !deadline) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create task object
    const newTask = {
      id: `new-${Date.now()}`,
      title,
      description,
      project: projectList.find(p => p.id === project)?.name || project,
      deadline,
      priority,
      status: 'Not Started',
      completed: false,
      assignedType: assignedTo,
      assignedTo: assignedTo === 'team' 
        ? { type: 'team', id: teamId, name: teams.find(t => t.id === teamId)?.name }
        : { type: 'user', id: userId, name: users.find(u => u.id === userId)?.name }
    };
    
    onAddTask(newTask);
    
    // Reset form
    resetForm();
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setProject(projectList.length > 0 ? projectList[0].id : '');
    setAssignedTo('user');
    setUserId(users.length > 0 ? users[0].id : '');
    setTeamId(teams.length > 0 ? teams[0].id : '');
    
    // Reset deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeadline(tomorrow.toISOString().split('T')[0]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Add New Task</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Task title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                placeholder="Enter task title"
                required
              />
            </div>
            
            {/* Project */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                required
              >
                <option value="">Select Project</option>
                {projectList.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Deadline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  required
                />
              </div>
            </div>
            
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Flag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            
            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Assign To
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="user"
                    checked={assignedTo === 'user'}
                    onChange={() => setAssignedTo('user')}
                    className="mr-2"
                  />
                  User
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="team"
                    checked={assignedTo === 'team'}
                    onChange={() => setAssignedTo('team')}
                    className="mr-2"
                  />
                  Team
                </label>
              </div>
              
              {assignedTo === 'user' ? (
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transform transition-transform hover:scale-105"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;