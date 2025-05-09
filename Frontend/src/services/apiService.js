import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service methods
const apiService = {
  // Users
  getUsers: () => api.get('/users'),
  getUser: (userId) => api.get(`/users/${userId}`),
  getCurrentUser: () => api.get('/current-user'),
  
  // Teams
  getTeams: () => api.get('/teams'),
  getTeam: (teamId) => api.get(`/teams/${teamId}`),
  
  // Projects
  getProjects: () => api.get('/projects'),
  getProject: (projectId) => api.get(`/projects/${projectId}`),
  
  // Tasks
  getTasks: () => api.get('/tasks'),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  
  // Notifications
  getNotifications: (userId) => api.get('/notifications', { params: { userId } }),
};

export default apiService;