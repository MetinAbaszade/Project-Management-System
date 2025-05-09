/**
 * SeedDataService.js
 * 
 * This service manages static seed data for development and connects 
 * to the future backend implementation.
 */

// Import seed data
// In a real app, we would fetch this from an API
import seedData from '../data/seedData.json';

class SeedDataService {
  constructor() {
    this.data = seedData || {
      users: [],
      projects: [],
      teams: [],
      tasks: [],
      notifications: []
    };
    
    // Attempt to load from localStorage if available
    this.loadFromLocalStorage();
  }
  
  // Load data from localStorage if available
  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('taskup_data');
      if (savedData) {
        this.data = JSON.parse(savedData);
        console.log('Data loaded from localStorage');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }
  
  // Save current data to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('taskup_data', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }
  
  // Reset to original seed data
  resetData() {
    this.data = seedData;
    this.saveToLocalStorage();
    return true;
  }
  
  // Users
  getUsers() {
    return [...this.data.users];
  }
  
  getUserById(id) {
    return this.data.users.find(user => user.id === id) || null;
  }
  
  searchUsers(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return this.data.users.filter(user => 
      user.firstName.toLowerCase().includes(lowerQuery) ||
      user.lastName.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Projects
  getProjects() {
    return [...this.data.projects];
  }
  
  getProjectById(id) {
    return this.data.projects.find(project => project.id === id) || null;
  }
  
  createProject(projectData) {
    const newProject = {
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0,
      status: 'Not Started',
      ...projectData
    };
    
    this.data.projects.push(newProject);
    this.saveToLocalStorage();
    return newProject;
  }
  
  updateProject(id, projectData) {
    const index = this.data.projects.findIndex(project => project.id === id);
    if (index === -1) return null;
    
    const updatedProject = {
      ...this.data.projects[index],
      ...projectData
    };
    
    this.data.projects[index] = updatedProject;
    this.saveToLocalStorage();
    return updatedProject;
  }
  
  deleteProject(id) {
    const initialLength = this.data.projects.length;
    this.data.projects = this.data.projects.filter(project => project.id !== id);
    
    // Also clean up related teams and tasks
    this.data.teams = this.data.teams.filter(team => team.projectId !== id);
    this.data.tasks = this.data.tasks.filter(task => task.projectId !== id);
    
    this.saveToLocalStorage();
    return initialLength > this.data.projects.length;
  }
  
  // Teams
  getTeams() {
    return [...this.data.teams];
  }
  
  getTeamsByProjectId(projectId) {
    return this.data.teams.filter(team => team.projectId === projectId);
  }
  
  getTeamById(id) {
    return this.data.teams.find(team => team.id === id) || null;
  }
  
  createTeam(teamData) {
    const newTeam = {
      id: `team-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tasks: [],
      ...teamData
    };
    
    this.data.teams.push(newTeam);
    this.saveToLocalStorage();
    return newTeam;
  }
  
  updateTeam(id, teamData) {
    const index = this.data.teams.findIndex(team => team.id === id);
    if (index === -1) return null;
    
    const updatedTeam = {
      ...this.data.teams[index],
      ...teamData
    };
    
    this.data.teams[index] = updatedTeam;
    this.saveToLocalStorage();
    return updatedTeam;
  }
  
  deleteTeam(id) {
    this.data.teams = this.data.teams.filter(team => team.id !== id);
    this.saveToLocalStorage();
    return true;
  }
  
  // Tasks
  getTasks() {
    return [...this.data.tasks];
  }
  
  getTasksByProjectId(projectId) {
    return this.data.tasks.filter(task => task.projectId === projectId);
  }
  
  getTasksByTeamId(teamId) {
    return this.data.tasks.filter(task => task.teamId === teamId);
  }
  
  getTaskById(id) {
    return this.data.tasks.find(task => task.id === id) || null;
  }
  
  createTask(taskData) {
    const newTask = {
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      completed: false,
      status: 'Not Started',
      comments: [],
      attachments: [],
      subtasks: [],
      ...taskData
    };
    
    this.data.tasks.push(newTask);
    
    // Add to team tasks if teamId is provided
    if (taskData.teamId) {
      const team = this.getTeamById(taskData.teamId);
      if (team) {
        team.tasks.push({
          id: newTask.id,
          title: newTask.title,
          status: newTask.status
        });
      }
    }
    
    this.saveToLocalStorage();
    return newTask;
  }
  
  updateTask(id, taskData) {
    const index = this.data.tasks.findIndex(task => task.id === id);
    if (index === -1) return null;
    
    const updatedTask = {
      ...this.data.tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    this.data.tasks[index] = updatedTask;
    
    // Update in team tasks if needed
    if (updatedTask.teamId) {
      const team = this.getTeamById(updatedTask.teamId);
      if (team) {
        const taskIndex = team.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          team.tasks[taskIndex] = {
            id: updatedTask.id,
            title: updatedTask.title,
            status: updatedTask.status
          };
        }
      }
    }
    
    this.saveToLocalStorage();
    return updatedTask;
  }
  
  deleteTask(id) {
    const task = this.getTaskById(id);
    if (!task) return false;
    
    this.data.tasks = this.data.tasks.filter(task => task.id !== id);
    
    // Remove from team tasks if needed
    if (task.teamId) {
      const team = this.getTeamById(task.teamId);
      if (team) {
        team.tasks = team.tasks.filter(t => t.id !== id);
      }
    }
    
    this.saveToLocalStorage();
    return true;
  }
  
  // Notifications
  getNotifications() {
    return [...this.data.notifications];
  }
  
  getUnreadNotificationsCount() {
    return this.data.notifications.filter(notification => !notification.read).length;
  }
  
  markNotificationAsRead(id) {
    const notification = this.data.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }
  
  markAllNotificationsAsRead() {
    this.data.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveToLocalStorage();
    return true;
  }
  
  // Calculate project progress based on tasks
  calculateProjectProgress(projectId) {
    const tasks = this.getTasksByProjectId(projectId);
    if (!tasks.length) return 0;
    
    // Weight tasks by priority
    const priorityWeights = {
      'High': 5,
      'Medium': 3,
      'Low': 1
    };
    
    let totalWeight = 0;
    let completedWeight = 0;
    
    tasks.forEach(task => {
      const weight = priorityWeights[task.priority] || 1;
      totalWeight += weight;
      
      if (task.status === 'Completed') {
        completedWeight += weight;
      } else if (task.status === 'In Progress') {
        // Partially count in-progress tasks
        completedWeight += (weight * 0.5);
      }
    });
    
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  }
  
  // Add a user to project stakeholders
  addProjectStakeholder(projectId, stakeholderData) {
    const project = this.getProjectById(projectId);
    if (!project) return null;
    
    if (!project.stakeholders) {
      project.stakeholders = [];
    }
    
    const newStakeholder = {
      id: `stake-${Date.now()}`,
      ...stakeholderData
    };
    
    project.stakeholders.push(newStakeholder);
    this.saveToLocalStorage();
    return newStakeholder;
  }
  
  // Update project stakeholder
  updateProjectStakeholder(projectId, stakeholderId, stakeholderData) {
    const project = this.getProjectById(projectId);
    if (!project || !project.stakeholders) return null;
    
    const index = project.stakeholders.findIndex(s => s.id === stakeholderId);
    if (index === -1) return null;
    
    project.stakeholders[index] = {
      ...project.stakeholders[index],
      ...stakeholderData
    };
    
    this.saveToLocalStorage();
    return project.stakeholders[index];
  }
  
  // Remove project stakeholder
  removeProjectStakeholder(projectId, stakeholderId) {
    const project = this.getProjectById(projectId);
    if (!project || !project.stakeholders) return false;
    
    const initialLength = project.stakeholders.length;
    project.stakeholders = project.stakeholders.filter(s => s.id !== stakeholderId);
    
    this.saveToLocalStorage();
    return initialLength > project.stakeholders.length;
  }
  
  // Add attachment to project, task, etc.
  addAttachment(type, id, attachmentData) {
    let item;
    
    switch (type) {
      case 'project':
        item = this.getProjectById(id);
        break;
      case 'task':
        item = this.getTaskById(id);
        break;
      default:
        return null;
    }
    
    if (!item) return null;
    
    if (!item.attachments) {
      item.attachments = [];
    }
    
    const newAttachment = {
      id: `attachment-${Date.now()}`,
      uploadedAt: new Date().toLocaleString(),
      ...attachmentData
    };
    
    item.attachments.push(newAttachment);
    this.saveToLocalStorage();
    return newAttachment;
  }
  
  // Add a comment to a task
  addTaskComment(taskId, commentData) {
    const task = this.getTaskById(taskId);
    if (!task) return null;
    
    if (!task.comments) {
      task.comments = [];
    }
    
    const newComment = {
      id: `comment-${Date.now()}`,
      time: 'Just now',
      ...commentData
    };
    
    task.comments.push(newComment);
    this.saveToLocalStorage();
    return newComment;
  }
}

// Create a singleton instance
const service = new SeedDataService();
export default service;