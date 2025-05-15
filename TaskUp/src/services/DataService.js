import { generateFullDataset } from '../utils/dataGenerator';

/**
 * DataService
 * 
 * Handles data storage and retrieval for the application.
 * Uses local storage to persist data between sessions and
 * generates random data initially if no data exists.
 */
class DataService {
  constructor() {
    this.storageKey = 'taskup_data';
    this.data = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the data service
   * Loads data from local storage or generates new data
   */
  async initialize() {
    if (this.initialized) return;
    
    // Try to load data from localStorage
    const storedData = localStorage.getItem(this.storageKey);
    
    if (storedData) {
      try {
        this.data = JSON.parse(storedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        this.data = this.generateNewData();
      }
    } else {
      // No stored data, generate new data
      this.data = this.generateNewData();
    }
    
    this.initialized = true;
    this.saveData();
  }
  
  /**
   * Generate a new dataset
   */
  generateNewData() {
    return generateFullDataset();
  }
  
  /**
   * Save current data to localStorage
   */
  saveData() {
    if (!this.data) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }
  
  /**
   * Reset data to a fresh generated dataset
   */
  resetData() {
    this.data = this.generateNewData();
    this.saveData();
    return true;
  }
  
  /**
   * Ensure the service is initialized before accessing data
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  
  // ===== USERS =====
  
  /**
   * Get all users
   */
  async getUsers() {
    await this.ensureInitialized();
    return this.data.users;
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(id) {
    await this.ensureInitialized();
    return this.data.users.find(user => user.id === id);
  }
  
  /**
   * Get current user (mock implementation)
   */
  async getCurrentUser() {
    await this.ensureInitialized();
    return this.data.users[0];
  }
  
  // ===== PROJECTS =====
  
  /**
   * Get all projects
   */
  async getProjects() {
    await this.ensureInitialized();
    return this.data.projects;
  }
  
  /**
   * Get a project by ID
   */
  async getProjectById(id) {
    await this.ensureInitialized();
    return this.data.projects.find(project => project.id === id);
  }
  
  /**
   * Create a new project
   */
  async createProject(projectData) {
    await this.ensureInitialized();
    
    const newProject = {
      ...projectData,
      id: projectData.id || `proj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      progress: projectData.progress || 0,
      status: projectData.status || 'Not Started',
      teams: projectData.teams || 0,
      tasks: projectData.tasks || 0
    };
    
    this.data.projects.push(newProject);
    this.saveData();
    
    return newProject;
  }
  
  /**
   * Update a project
   */
  async updateProject(id, updates) {
    await this.ensureInitialized();
    
    const index = this.data.projects.findIndex(project => project.id === id);
    if (index === -1) return null;
    
    this.data.projects[index] = {
      ...this.data.projects[index],
      ...updates
    };
    
    this.saveData();
    return this.data.projects[index];
  }
  
  /**
   * Delete a project
   */
  async deleteProject(id) {
    await this.ensureInitialized();
    
    const initialCount = this.data.projects.length;
    this.data.projects = this.data.projects.filter(project => project.id !== id);
    
    // Also delete related tasks
    this.data.tasks = this.data.tasks.filter(task => task.projectId !== id);
    
    this.saveData();
    return initialCount > this.data.projects.length;
  }
  
  // ===== TASKS =====
  
  /**
   * Get all tasks with optional filtering
   */
  async getTasks(options = {}) {
    await this.ensureInitialized();
    
    let tasks = this.data.tasks;
    
    // Filter by project if specified
    if (options.projectId) {
      tasks = tasks.filter(task => task.projectId === options.projectId);
    }
    
    // Filter by status if specified
    if (options.status) {
      tasks = tasks.filter(task => task.status === options.status);
    }
    
    // Filter by priority if specified
    if (options.priority) {
      tasks = tasks.filter(task => task.priority === options.priority);
    }
    
    // Limit results if specified
    if (options.limit && options.limit > 0) {
      tasks = tasks.slice(0, options.limit);
    }
    
    return tasks;
  }
  
  /**
   * Get a task by ID
   */
  async getTaskById(id) {
    await this.ensureInitialized();
    return this.data.tasks.find(task => task.id === id);
  }
  
  /**
   * Create a new task
   */
  async createTask(taskData) {
    await this.ensureInitialized();
    
    const newTask = {
      ...taskData,
      id: taskData.id || `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      comments: taskData.comments || [],
      attachments: taskData.attachments || [],
      subtasks: taskData.subtasks || [],
      completed: taskData.status === 'Completed'
    };
    
    // Add project name if missing
    if (!newTask.project && newTask.projectId) {
      const project = this.data.projects.find(p => p.id === newTask.projectId);
      if (project) {
        newTask.project = project.name;
      }
    }
    
    this.data.tasks.push(newTask);
    this.saveData();
    
    return newTask;
  }
  
  /**
   * Update a task
   */
  async updateTask(id, updates) {
    await this.ensureInitialized();
    
    const index = this.data.tasks.findIndex(task => task.id === id);
    if (index === -1) return null;
    
    // Update the completed flag if status changes
    if (updates.status && updates.status !== this.data.tasks[index].status) {
      updates.completed = updates.status === 'Completed';
    }
    
    // Update the updatedAt timestamp
    updates.updatedAt = new Date().toISOString().split('T')[0];
    
    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates
    };
    
    this.saveData();
    return this.data.tasks[index];
  }
  
  /**
   * Delete a task
   */
  async deleteTask(id) {
    await this.ensureInitialized();
    
    const initialCount = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(task => task.id !== id);
    
    this.saveData();
    return initialCount > this.data.tasks.length;
  }
  
  // ===== NOTIFICATIONS =====
  
  /**
   * Get all notifications with optional limiting
   */
  async getNotifications(options = {}) {
    await this.ensureInitialized();
    
    let notifications = this.data.notifications;
    
    // Limit results if specified
    if (options.limit && options.limit > 0) {
      notifications = notifications.slice(0, options.limit);
    }
    
    return notifications;
  }
  
  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(id) {
    await this.ensureInitialized();
    
    const notification = this.data.notifications.find(n => n.id === id);
    if (!notification) return false;
    
    notification.read = true;
    this.saveData();
    
    return true;
  }
  
  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead() {
    await this.ensureInitialized();
    
    this.data.notifications.forEach(notification => {
      notification.read = true;
    });
    
    this.saveData();
    return true;
  }
  
  // ===== ANALYTICS =====
  
  /**
   * Get analytics data
   */
  async getAnalyticsData() {
    await this.ensureInitialized();
    return this.data.analyticsData;
  }
}

// Create a singleton instance
const dataService = new DataService();

export default dataService;