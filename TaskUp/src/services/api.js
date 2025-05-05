// src/services/api.js
// API service layer that can be easily swapped between mock and real implementation

import * as mockData from '../data/seeds';
import { getRandomItems, generateRandomId } from '../utils/randomizer';

// Flag to determine if we're using mock data or real API
// Set to false when you're ready to connect to the real backend
const USE_MOCK_DATA = true;

// Helper for simulating API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ===== PROJECT SERVICES =====

export const getProjects = async () => {
  if (USE_MOCK_DATA) {
    // Simulate API call with mock data
    await delay(800);
    return [...mockData.projects];
  } else {
    // Real API call
    const response = await fetch('/api/projects');
    return response.json();
  }
};

export const getProject = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    const project = mockData.projects.find(p => p.id === id);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return {...project};
  } else {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) {
      throw new Error('Project not found');
    }
    return response.json();
  }
};

export const createProject = async (projectData) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    const newProject = {
      ...projectData,
      id: generateRandomId('proj-'),
      createdAt: new Date().toISOString().split('T')[0],
      tasks: 0,
      teams: 0
    };
    
    // In a real application, we would update our mockData here
    // But for this example, we'll just return the new project
    return newProject;
  } else {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    
    return response.json();
  }
};

export const updateProject = async (id, updates) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    const projectIndex = mockData.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    // Return updated project (in a real app, we would update our mockData)
    return {
      ...mockData.projects[projectIndex],
      ...updates,
      id
    };
  } else {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    
    return response.json();
  }
};

export const deleteProject = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const projectIndex = mockData.projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    
    return response.json();
  }
};

// ===== TASK SERVICES =====

export const getTasks = async (options = {}) => {
  if (USE_MOCK_DATA) {
    await delay(700);
    
    let tasks = [...mockData.tasks];
    
    // Filter by project if specified
    if (options.projectId) {
      tasks = tasks.filter(task => task.projectId === options.projectId);
    }
    
    // Handle limit if specified
    if (options.limit && options.limit > 0) {
      tasks = tasks.slice(0, options.limit);
    }
    
    return tasks;
  } else {
    let url = '/api/tasks';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.limit) params.append('limit', options.limit);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    return response.json();
  }
};

export const getTask = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const task = mockData.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return {...task};
  } else {
    const response = await fetch(`/api/tasks/${id}`);
    
    if (!response.ok) {
      throw new Error('Task not found');
    }
    
    return response.json();
  }
};

export const createTask = async (taskData) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    const newTask = {
      ...taskData,
      id: generateRandomId('task-'),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      comments: [],
      attachments: []
    };
    
    // In a real app, we would update our mockData
    return newTask;
  } else {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    return response.json();
  }
};

export const updateTask = async (id, updates) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const taskIndex = mockData.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    // Return updated task (in a real app, we would update our mockData)
    return {
      ...mockData.tasks[taskIndex],
      ...updates,
      id,
      updatedAt: new Date().toISOString().split('T')[0]
    };
  } else {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    
    return response.json();
  }
};

export const deleteTask = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const taskIndex = mockData.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
    
    return response.json();
  }
};

// ===== TEAM SERVICES =====

export const getTeams = async () => {
  if (USE_MOCK_DATA) {
    await delay(800);
    return [...mockData.teams];
  } else {
    const response = await fetch('/api/teams');
    return response.json();
  }
};

export const getTeam = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const team = mockData.teams.find(t => t.id === id);
    if (!team) {
      throw new Error('Team not found');
    }
    
    return {...team};
  } else {
    const response = await fetch(`/api/teams/${id}`);
    
    if (!response.ok) {
      throw new Error('Team not found');
    }
    
    return response.json();
  }
};

export const createTeam = async (teamData) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    const newTeam = {
      ...teamData,
      id: generateRandomId('team-'),
      createdDate: new Date().toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      })
    };
    
    // In a real app, we would update our mockData
    return newTeam;
  } else {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamData)
    });
    
    return response.json();
  }
};

export const updateTeam = async (id, updates) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    const teamIndex = mockData.teams.findIndex(t => t.id === id);
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    // Return updated team
    return {
      ...mockData.teams[teamIndex],
      ...updates,
      id
    };
  } else {
    const response = await fetch(`/api/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update team');
    }
    
    return response.json();
  }
};

export const deleteTeam = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const teamIndex = mockData.teams.findIndex(t => t.id === id);
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch(`/api/teams/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete team');
    }
    
    return response.json();
  }
};

export const addTeamMembers = async (teamId, newMembers) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    const teamIndex = mockData.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true, addedMembers: newMembers };
  } else {
    const response = await fetch(`/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ members: newMembers })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add team members');
    }
    
    return response.json();
  }
};

export const removeTeamMember = async (teamId, memberId) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const teamIndex = mockData.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove team member');
    }
    
    return response.json();
  }
};

export const updateTeamLeader = async (teamId, leaderId) => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    const teamIndex = mockData.teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) {
      throw new Error('Team not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch(`/api/teams/${teamId}/leader`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ leaderId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update team leader');
    }
    
    return response.json();
  }
};

// ===== USER SERVICES =====

export const getUsers = async () => {
  if (USE_MOCK_DATA) {
    await delay(700);
    return mockData.users.map(user => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`
    }));
  } else {
    const response = await fetch('/api/users');
    return response.json();
  }
};

export const getCurrentUser = async () => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    // Return the first user as the current user
    const user = mockData.users[0];
    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`
    };
  } else {
    const response = await fetch('/api/users/me');
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return response.json();
  }
};

// ===== NOTIFICATION SERVICES =====

export const getNotifications = async (options = {}) => {
  if (USE_MOCK_DATA) {
    await delay(600);
    
    let notifications = [...mockData.notifications];
    
    // Handle limit if specified
    if (options.limit && options.limit > 0) {
      notifications = notifications.slice(0, options.limit);
    }
    
    return notifications;
  } else {
    let url = '/api/notifications';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    return response.json();
  }
};

export const markNotificationAsRead = async (id) => {
  if (USE_MOCK_DATA) {
    await delay(300);
    
    const notificationIndex = mockData.notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return response.json();
  }
};

export const markAllNotificationsAsRead = async () => {
  if (USE_MOCK_DATA) {
    await delay(400);
    
    // In a real app, we would update our mockData
    return { success: true };
  } else {
    const response = await fetch('/api/notifications/read-all', {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return response.json();
  }
};

// ===== ANALYTICS SERVICES =====

export const getAnalyticsData = async (dateRange = '30days') => {
  if (USE_MOCK_DATA) {
    await delay(1500);
    return {...mockData.analyticsData};
  } else {
    const response = await fetch(`/api/analytics?range=${dateRange}`);
    return response.json();
  }
};

// ===== CHAT SERVICES =====

export const getChatMessages = async (projectId) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    return [...mockData.chatMessages];
  } else {
    const response = await fetch(`/api/projects/${projectId}/chat`);
    return response.json();
  }
};

export const sendChatMessage = async (projectId, message) => {
  if (USE_MOCK_DATA) {
    await delay(300);
    
    const newMessage = {
      id: generateRandomId('msg-'),
      user: { id: '1', name: 'You' },
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      own: true
    };
    
    // In a real app, we would update our mockData
    return newMessage;
  } else {
    const response = await fetch(`/api/projects/${projectId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: message })
    });
    
    return response.json();
  }
};

// Exporting all services as an object with api namespace
export const api = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMembers,
  removeTeamMember,
  updateTeamLeader,
  
  getUsers,
  getCurrentUser,
  
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  
  getAnalyticsData,
  
  getChatMessages,
  sendChatMessage
};

// Export the api object as default export
export default api;