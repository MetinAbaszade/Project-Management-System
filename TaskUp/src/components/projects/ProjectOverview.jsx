import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, CheckSquare, Users, 
  BarChart2, Calendar, Clock, MoreHorizontal, Plus,
  FileText, Users as UsersIcon, Percent, X
} from 'lucide-react';
import AddTaskModal from '../tasks/AddTaskModal';

const ProjectOverview = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showEditScopeModal, setShowEditScopeModal] = useState(false);
  const [showAddStakeholderModal, setShowAddStakeholderModal] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch project data
    setTimeout(() => {
      const projectData = {
        id: projectId,
        name: projectId === '1' 
          ? 'Website Redesign' 
          : projectId === '2' 
            ? 'Mobile App Development' 
            : 'Marketing Campaign',
        description: projectId === '1'
          ? 'Completely revamp the company website with modern design principles and improved UX.'
          : projectId === '2'
            ? 'Create native iOS and Android applications with core functionality from our web platform.'
            : 'Launch Q2 marketing campaign across digital and traditional channels to increase brand awareness.',
        progress: projectId === '1' ? 65 : projectId === '2' ? 30 : 85,
        deadline: projectId === '1' 
          ? '2025-05-15' 
          : projectId === '2' 
            ? '2025-06-30' 
            : '2025-04-20',
        status: 'In Progress',
        createdAt: '2025-03-01',
        teams: [
          { id: '1', name: 'Design Team', members: 4 },
          { id: '2', name: 'Development Team', members: 5 }
        ],
        tasks: [
          { 
            id: '1', 
            title: 'Design homepage mockup', 
            assignee: 'John Doe', 
            deadline: '2025-04-10', 
            status: 'In Progress', 
            priority: 'High'
          },
          { 
            id: '2', 
            title: 'Implement authentication', 
            assignee: 'Sarah Miller', 
            deadline: '2025-04-12', 
            status: 'Not Started', 
            priority: 'Medium' 
          },
          { 
            id: '3', 
            title: 'Create content for social media', 
            assignee: 'Michael Chen', 
            deadline: '2025-04-08', 
            status: 'Completed', 
            priority: 'High' 
          },
          { 
            id: '4', 
            title: 'Optimize database queries', 
            assignee: 'Lisa Park', 
            deadline: '2025-04-15', 
            status: 'In Progress', 
            priority: 'Low' 
          },
          { 
            id: '5', 
            title: 'Fix navigation menu', 
            assignee: 'David Garcia', 
            deadline: '2025-04-11', 
            status: 'Not Started', 
            priority: 'Medium' 
          }
        ],
        activities: [
          { id: '1', user: 'John Doe', action: 'created task', target: 'Design homepage mockup', time: '2 days ago' },
          { id: '2', user: 'Sarah Miller', action: 'commented on', target: 'Implement authentication', time: '1 day ago' },
          { id: '3', user: 'Michael Chen', action: 'completed task', target: 'Create content for social media', time: '10 hours ago' },
          { id: '4', user: 'Emily Wong', action: 'was assigned to task', target: 'Fix navigation menu', time: '5 hours ago' }
        ],
        // Added scope data
        scope: {
          included: "- Full redesign of all customer-facing pages\n- Mobile responsiveness\n- Integration with existing backend APIs\n- SEO optimization\n- Performance optimization",
          excluded: "- Backend development\n- Content creation\n- Hosting migration",
          startDate: '2025-03-15',
          endDate: '2025-06-30'
        },
        // Added stakeholders data
        stakeholders: [
          { id: '1', userId: '1', userName: 'John Doe', percentage: 40, role: 'Project Manager' },
          { id: '2', userId: '2', userName: 'Sarah Miller', percentage: 30, role: 'Lead Developer' },
          { id: '3', userId: '3', userName: 'Michael Chen', percentage: 20, role: 'Designer' },
          { id: '4', userId: '4', userName: 'Lisa Park', percentage: 10, role: 'QA Engineer' }
        ]
      };
      
      setProject(projectData);
      setIsLoading(false);
    }, 1000);
  }, [projectId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

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

  const handleDeleteProject = () => {
    // In a real app, you'd call an API to delete the project
    setIsLoading(true);
    setTimeout(() => {
      navigate('/projects');
    }, 500);
  };

  const handleEditProject = () => {
    setShowEditModal(true);
    // You would implement an edit modal or navigate to an edit page
    alert("Edit project functionality would be implemented here");
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAddTask = (task) => {
    // Add the new task to the project
    if (project) {
      const newTask = {
        ...task,
        id: `task-${Date.now()}`,
        status: 'Not Started'
      };
      
      setProject({
        ...project,
        tasks: [...project.tasks, newTask]
      });
    }
    setShowTaskModal(false);
  };

  const handleAddTeam = () => {
    setShowAddTeamModal(true);
    // Implement team addition modal
    alert("Add team functionality would be implemented here");
  };

  const handleEditScope = () => {
    setShowEditScopeModal(true);
  };

  const handleAddStakeholder = () => {
    setShowAddStakeholderModal(true);
  };

  const ScopeEditModal = ({ isOpen, onClose, scope, onSave }) => {
    const [included, setIncluded] = useState(scope?.included || '');
    const [excluded, setExcluded] = useState(scope?.excluded || '');
    const [startDate, setStartDate] = useState(scope?.startDate ? new Date(scope.startDate).toISOString().split('T')[0] : '');
    const [endDate, setEndDate] = useState(scope?.endDate ? new Date(scope.endDate).toISOString().split('T')[0] : '');

    const handleSubmit = (e) => {
      e.preventDefault();
      
      onSave({
        included,
        excluded,
        startDate,
        endDate
      });
      
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Project Scope</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scope Includes</label>
                <textarea
                  value={included}
                  onChange={(e) => setIncluded(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  placeholder="List items included in the project scope (one per line)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Use markdown format, e.g., "- Item 1" for bullet points</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Scope Excludes</label>
                <textarea
                  value={excluded}
                  onChange={(e) => setExcluded(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  placeholder="List items excluded from the project scope (one per line)"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Use markdown format, e.g., "- Item 1" for bullet points</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const StakeholderModal = ({ isOpen, onClose, onSave }) => {
    const [userName, setUserName] = useState('');
    const [percentage, setPercentage] = useState(10);
    const [role, setRole] = useState('');
    
    // This would typically be fetched from an API
    const availableUsers = [
      { id: '5', name: 'Emily Wong' },
      { id: '6', name: 'David Garcia' },
      { id: '7', name: 'Amanda Taylor' }
    ];

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Simple validation
      if (!userName || percentage <= 0 || percentage > 100 || !role) {
        alert('Please fill in all fields correctly');
        return;
      }
      
      // Find the selected user
      const selectedUser = availableUsers.find(user => user.name === userName);
      
      onSave({
        id: `stakeholder-${Date.now()}`,
        userId: selectedUser ? selectedUser.id : Date.now().toString(),
        userName,
        percentage: Number(percentage),
        role
      });
      
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Stakeholder</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  required
                >
                  <option value="">Select a user</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Percentage of ownership in the project (1-100)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  placeholder="e.g., Developer, Designer, Investor"
                  required
                />
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Add Stakeholder
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleSaveScope = (updatedScope) => {
    setProject({
      ...project,
      scope: updatedScope
    });
  };

  const handleSaveStakeholder = (newStakeholder) => {
    setProject({
      ...project,
      stakeholders: [...project.stakeholders, newStakeholder]
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 mr-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleEditProject}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="flex-1">
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Created on {formatDate(project.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>Due {formatDate(project.deadline)}</span>
                <span className="mx-2">•</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {project.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Progress</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{project.progress}%</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-4 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-2">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold">{project.tasks.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks</div>
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mb-2">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold">{project.teams.reduce((sum, team) => sum + team.members, 0)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Team Members</div>
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-2">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div className="text-2xl font-semibold">
                {project.tasks.filter(task => task.status === 'Completed').length}/{project.tasks.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4 mr-2" /> },
              { id: 'scope', label: 'Scope', icon: <FileText className="w-4 h-4 mr-2" /> },
              { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4 mr-2" /> },
              { id: 'stakeholders', label: 'Stakeholders', icon: <Percent className="w-4 h-4 mr-2" /> },
              { id: 'activity', label: 'Activity', icon: <Clock className="w-4 h-4 mr-2" /> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`inline-flex items-center px-4 py-3 font-medium text-sm border-b-2 min-w-max ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Tasks ({project.tasks.length})</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Task
                </button>
              </div>

              <div className="space-y-3">
                {project.tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className={`w-3 h-3 mt-1.5 rounded-full ${getPriorityColor(task.priority)} mr-3 flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Assigned to: {task.assignee}
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Due {formatDate(task.deadline)}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show task options menu
                        alert('Task options would appear here');
                      }}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                {project.tasks.length === 0 && (
                  <div className="text-center py-8">
                    <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Get started by adding a task to this project
                    </p>
                    <button 
                      onClick={() => setShowTaskModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                    >
                      Add First Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scope Tab */}
          {activeTab === 'scope' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Project Scope</h2>
                <button
                  onClick={handleEditScope}
                  className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  <Edit className="w-4 h-4 mr-1.5" />
                  Edit Scope
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timeframe: {formatDate(project.scope.startDate)} - {formatDate(project.scope.endDate)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Included in Scope</h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 font-sans">{project.scope.included}</pre>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3 text-gray-700 dark:text-gray-300">Excluded from Scope</h3>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 font-sans">{project.scope.excluded}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Teams ({project.teams.length})</h2>
                <button 
                  onClick={handleAddTeam}
                  className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Team
                </button>
              </div>

              <div className="space-y-3">
                {project.teams.map(team => (
                  <div 
                    key={team.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-xl mr-3">
                        {team.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {team.members} members
                        </div>
                      </div>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show team options
                        alert('Team options would appear here');
                      }}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                ))}

                {project.teams.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No teams assigned</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Assign a team to this project to start collaborating
                    </p>
                    <button 
                      onClick={handleAddTeam}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                    >
                      Add First Team
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stakeholders Tab */}
          {activeTab === 'stakeholders' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stakeholders ({project.stakeholders.length})</h2>
                <button
                  onClick={handleAddStakeholder}
                  className="flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Stakeholder
                </button>
              </div>

              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {project.stakeholders.map((stakeholder) => (
                      <tr key={stakeholder.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                              {stakeholder.userName.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {stakeholder.userName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{stakeholder.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${stakeholder.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{stakeholder.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                            onClick={() => alert('Edit stakeholder feature would be implemented here')}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            onClick={() => alert('Remove stakeholder feature would be implemented here')}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Display total percentage allocated */}
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Allocation
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {project.stakeholders.reduce((total, s) => total + s.percentage, 0)}% of 100%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      project.stakeholders.reduce((total, s) => total + s.percentage, 0) > 100 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(
                        project.stakeholders.reduce((total, s) => total + s.percentage, 0), 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
                {project.stakeholders.reduce((total, s) => total + s.percentage, 0) > 100 && (
                  <p className="text-sm text-red-500 mt-2">
                    Warning: Total allocation exceeds 100%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

              <div className="space-y-4">
                {project.activities.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}

                {project.activities.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No activity yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Activity will be recorded as you and your team work on this project
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <AddTaskModal 
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onAddTask={handleAddTask}
          projects={[project]}
        />
      )}

      {/* Edit Scope Modal */}
      {showEditScopeModal && (
        <ScopeEditModal
          isOpen={showEditScopeModal}
          onClose={() => setShowEditScopeModal(false)}
          scope={project.scope}
          onSave={handleSaveScope}
        />
      )}

      {/* Add Stakeholder Modal */}
      {showAddStakeholderModal && (
        <StakeholderModal
          isOpen={showAddStakeholderModal}
          onClose={() => setShowAddStakeholderModal(false)}
          onSave={handleSaveStakeholder}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Project</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{project.name}</span>? This action cannot be undone and all associated data will be permanently lost.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;