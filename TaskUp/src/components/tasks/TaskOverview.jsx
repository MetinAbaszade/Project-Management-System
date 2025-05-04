import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, MessageSquare, 
  Calendar, Clock, Users, XCircle, CheckCircle, 
  Flag, MoreHorizontal, AlertCircle
} from 'lucide-react';

const TaskOverview = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [task, setTask] = useState(location.state?.task || null);
  const [isLoading, setIsLoading] = useState(!location.state?.task);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  useEffect(() => {
    // If we don't have the task in location state, fetch it
    if (!task) {
      // Simulate API call to fetch task data
      setTimeout(() => {
        const taskData = {
          id: taskId,
          title: taskId === '1' ? 'Design homepage mockup' 
            : taskId === '2' ? 'Implement authentication' 
            : taskId === '3' ? 'Create content for social media'
            : taskId === '4' ? 'Optimize database queries'
            : 'Fix navigation menu',
          description: taskId === '1' 
            ? 'Create a modern, responsive design for the new homepage following the brand guidelines.'
            : taskId === '2'
              ? 'Implement secure authentication with social login options and two-factor authentication.'
              : taskId === '3'
                ? 'Develop engaging content for our social media platforms to support the new campaign.'
                : taskId === '4'
                  ? 'Optimize the database queries to improve application performance and reduce load times.'
                  : 'Fix navigation menu issues on mobile devices and ensure it\'s accessible.',
          project: taskId === '1' || taskId === '5' 
            ? 'Website Redesign' 
            : taskId === '2' || taskId === '4' 
              ? 'Mobile App Development' 
              : 'Marketing Campaign',
          projectId: taskId === '1' || taskId === '5' ? '1' : taskId === '2' || taskId === '4' ? '2' : '3',
          assignee: taskId === '1' ? 'John Doe' 
            : taskId === '2' ? 'Sarah Miller' 
            : taskId === '3' ? 'Michael Chen'
            : taskId === '4' ? 'Lisa Park'
            : 'David Garcia',
          assignedType: taskId === '1' || taskId === '4' ? 'user' : 'team',
          assignedTo: taskId === '1' ? 
            { type: 'user', id: '1', name: 'John Doe' } 
            : taskId === '2' ? 
              { type: 'team', id: '2', name: 'Development Team' } 
              : taskId === '3' ? 
                { type: 'team', id: '3', name: 'Marketing Team' }
                : taskId === '4' ? 
                  { type: 'user', id: '4', name: 'Lisa Park' }
                  : { type: 'user', id: '5', name: 'David Garcia' },
          status: taskId === '3' ? 'Completed' : taskId === '1' || taskId === '4' ? 'In Progress' : 'Not Started',
          priority: taskId === '1' || taskId === '3' ? 'High' : taskId === '2' || taskId === '5' ? 'Medium' : 'Low',
          deadline: taskId === '1' ? '2025-04-10' 
            : taskId === '2' ? '2025-04-12' 
            : taskId === '3' ? '2025-04-08'
            : taskId === '4' ? '2025-04-15'
            : '2025-04-11',
          createdAt: '2025-03-15',
          updatedAt: '2025-04-02',
          comments: [
            {
              id: '1',
              user: 'John Doe',
              text: 'I\'ve started working on this. Will have a draft ready by tomorrow.',
              time: '2 days ago'
            },
            {
              id: '2',
              user: 'Sarah Miller',
              text: 'Looking forward to seeing the draft. Let me know if you need any clarification.',
              time: '1 day ago'
            }
          ],
          attachments: [
            {
              id: '1',
              name: 'design_requirements.pdf',
              size: '2.4 MB',
              type: 'pdf',
              uploadedBy: 'John Doe',
              uploadedAt: '2 days ago'
            }
          ],
          subtasks: [
            {
              id: '1',
              title: 'Research competitor designs',
              completed: true
            },
            {
              id: '2',
              title: 'Create wireframes',
              completed: true
            },
            {
              id: '3',
              title: 'Design UI components',
              completed: false
            },
            {
              id: '4',
              title: 'Finalize mockup',
              completed: false
            }
          ]
        };
        
        setTask(taskData);
        setIsLoading(false);
      }, 1000);
    }
  }, [taskId, task]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysUntilDeadline = (deadlineString) => {
    const today = new Date();
    const deadline = new Date(deadlineString);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  const handleStatusChange = (newStatus) => {
    setTask({ ...task, status: newStatus });
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (newPriority) => {
    setTask({ ...task, priority: newPriority });
    setShowPriorityDropdown(false);
  };

  const handleSubtaskToggle = (subtaskId) => {
    setTask({
      ...task,
      subtasks: task.subtasks.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: `new-${Date.now()}`,
      user: 'You',
      text: newComment,
      time: 'Just now'
    };
    
    setTask({
      ...task,
      comments: [...(task.comments || []), newCommentObj]
    });
    
    setNewComment('');
  };

  const handleDeleteTask = () => {
    // In a real app, you'd call an API to delete the task
    setIsLoading(true);
    setTimeout(() => {
      navigate(`/projects/${task.projectId}`);
    }, 500);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Not Started':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'High':
        return <Flag className="h-5 w-5 text-red-500" />;
      case 'Medium':
        return <Flag className="h-5 w-5 text-yellow-500" />;
      case 'Low':
        return <Flag className="h-5 w-5 text-green-500" />;
      default:
        return <Flag className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Helper function to safely get first character or provide fallback
  const getInitial = (name) => {
    if (!name) return 'U'; // U for Unknown/Unassigned
    return name.charAt(0);
  };

  // Helper function to display assignee information
  const getAssigneeInfo = () => {
    if (!task.assignedTo || (!task.assignedTo.name && !task.assignee)) {
      return { name: 'Unassigned', type: null };
    }
    
    // Support both structures: task.assignedTo object and legacy task.assignee string
    if (task.assignedTo && task.assignedTo.name) {
      return { 
        name: task.assignedTo.name, 
        type: task.assignedTo.type || task.assignedType || 'user' 
      };
    }
    
    return { 
      name: task.assignee, 
      type: task.assignedType || 'user'
    };
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
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const assigneeInfo = getAssigneeInfo();

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 mr-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <button 
                onClick={() => navigate(`/projects/${task.projectId}`)}
                className="hover:text-blue-500 hover:underline"
              >
                {task.project}
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex overflow-x-auto">
                {[
                  { id: 'details', label: 'Details' },
                  { id: 'comments', label: 'Comments', count: task.comments?.length || 0 },
                  { id: 'attachments', label: 'Attachments', count: task.attachments?.length || 0 }
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
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                    <p className="text-gray-900 dark:text-white">{task.description}</p>
                  </div>

                  {task.subtasks && task.subtasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Subtasks ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})
                      </h3>
                      <div className="space-y-2">
                        {task.subtasks.map(subtask => (
                          <div
                            key={subtask.id}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => handleSubtaskToggle(subtask.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className={`ml-2 text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Activity</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>Created on {formatDate(task.createdAt)}</p>
                      <p>Last updated on {formatDate(task.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map(comment => (
                        <div key={comment.id} className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                            {getInitial(comment.user)}
                          </div>
                          <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-750 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.user}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {comment.time}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No comments yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Be the first to comment on this task
                        </p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleCommentSubmit} className="mt-4">
                    <label htmlFor="comment" className="sr-only">
                      Add a comment
                    </label>
                    <textarea
                      id="comment"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  {task.attachments && task.attachments.length > 0 ? (
                    task.attachments.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 mr-3">
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-1">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <svg className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No attachments</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Upload files to share with the team
                      </p>
                      <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg">
                        Upload File
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Task Properties */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Task Properties</h3>
            
            {/* Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`w-full flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-lg ${getStatusColor(task.status)}`}
                >
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-2">{task.status}</span>
                  </div>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                    {['Not Started', 'In Progress', 'Completed'].map(status => (
                      <button
                        key={status}
                        className={`w-full flex items-center p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-750 ${status === task.status ? 'bg-gray-50 dark:bg-gray-750' : ''}`}
                        onClick={() => handleStatusChange(status)}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-2">{status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Priority */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Priority
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  className={`w-full flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-lg ${getPriorityColor(task.priority)}`}
                >
                  <div className="flex items-center">
                    {getPriorityIcon(task.priority)}
                    <span className="ml-2">{task.priority}</span>
                  </div>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showPriorityDropdown && (
                  <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                    {['High', 'Medium', 'Low'].map(priority => (
                      <button
                        key={priority}
                        className={`w-full flex items-center p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-750 ${priority === task.priority ? 'bg-gray-50 dark:bg-gray-750' : ''}`}
                        onClick={() => handlePriorityChange(priority)}
                      >
                        <div className="flex items-center">
                          {getPriorityIcon(priority)}
                          <span className="ml-2">{priority}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Assignee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Assigned To
              </label>
              <div className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                  {getInitial(assigneeInfo.name)}
                </div>
                <div className="flex-1">
                  <span className="text-gray-900 dark:text-white">{assigneeInfo.name}</span>
                  {assigneeInfo.type && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                      {assigneeInfo.type === 'team' ? 'Team' : 'Individual'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Due Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Due Date
              </label>
              <div className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-gray-900 dark:text-white">{formatDate(task.deadline)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{daysUntilDeadline(task.deadline)}</div>
                </div>
              </div>
            </div>
            
            {/* Created / Updated */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-2">
                <Clock className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  Created on {formatDate(task.createdAt)}
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  Updated on {formatDate(task.updatedAt)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/projects/${task.projectId}`)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                View Project
              </button>
              <button 
                onClick={() => {
                  setTask({...task, status: 'Completed'});
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Mark as Completed
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Task</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{task.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskOverview;