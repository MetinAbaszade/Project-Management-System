/**
 * Data Generator Utility
 * 
 * Generates realistic mock data for the application instead of
 * hard-coding seed data in the application.
 */

// Generate a random ID with optional prefix
export const generateId = (prefix = '') => {
    return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // Generate a random date between two dates
  export const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };
  
  // Format a date to a readable string
  export const formatDate = (date, format = 'short') => {
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (format === 'iso') {
      return date.toISOString().split('T')[0];
    } else if (format === 'time') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (format === 'datetime') {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString();
  };
  
  // Generate users
  export const generateUsers = (count = 10) => {
    const userNames = [
      { first: 'John', last: 'Doe' },
      { first: 'Sarah', last: 'Miller' },
      { first: 'Michael', last: 'Chen' },
      { first: 'Emily', last: 'Wong' },
      { first: 'Alex', last: 'Johnson' },
      { first: 'Lisa', last: 'Park' },
      { first: 'David', last: 'Garcia' },
      { first: 'Olivia', last: 'Kim' },
      { first: 'Ryan', last: 'Martinez' },
      { first: 'Jessica', last: 'Lee' },
      { first: 'Brian', last: 'Wilson' },
      { first: 'Amanda', last: 'Taylor' },
      { first: 'Thomas', last: 'Wright' },
      { first: 'Rachel', last: 'Green' },
      { first: 'Carlos', last: 'Rodriguez' },
      { first: 'Sophia', last: 'Chen' },
      { first: 'James', last: 'Wilson' },
      { first: 'Emma', last: 'Davis' },
      { first: 'Daniel', last: 'Brown' },
      { first: 'Ava', last: 'Smith' }
    ];
    
    const roles = [
      'Product Manager',
      'Project Manager',
      'UX Designer',
      'UI Designer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'QA Engineer',
      'DevOps Engineer',
      'Data Analyst',
      'Marketing Manager',
      'Content Creator'
    ];
    
    const users = [];
    
    for (let i = 0; i < Math.min(count, userNames.length); i++) {
      const { first, last } = userNames[i];
      const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
      const role = roles[Math.floor(Math.random() * roles.length)];
      
      // Random date in the last 12 months for creation date
      const createdAt = randomDate(
        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        new Date(new Date().setMonth(new Date().getMonth() - 1))
      );
      
      // Random date in the last week for last login
      const lastLogin = randomDate(
        new Date(new Date().setDate(new Date().getDate() - 7)),
        new Date()
      );
      
      users.push({
        id: generateId('user-'),
        firstName: first,
        lastName: last,
        email,
        role,
        imageUrl: null,
        lastLogin: formatDate(lastLogin, 'datetime'),
        createdAt: formatDate(createdAt, 'datetime')
      });
    }
    
    return users;
  };
  
  // Generate projects
  export const generateProjects = (userIds, count = 5) => {
    const projectNames = [
      'Website Redesign',
      'Mobile App Development',
      'Marketing Campaign',
      'Product Launch',
      'Office Relocation',
      'Sales Training Program',
      'CRM Implementation',
      'Brand Refresh',
      'Cloud Migration',
      'Data Analytics Platform'
    ];
    
    const projectDescriptions = [
      'Completely revamp the company website with modern design principles and improved UX.',
      'Create native iOS and Android applications with core functionality from our web platform.',
      'Launch Q2 marketing campaign across digital and traditional channels to increase brand awareness.',
      'Coordinate the launch of our new flagship product including PR, marketing, and sales training.',
      'Plan and execute the move to our new headquarters with minimal disruption to operations.',
      'Develop and implement a comprehensive training program for the sales team on new products.',
      'Implement and customize the new CRM system to improve sales and customer support processes.',
      'Update brand guidelines and refresh visual identity across all platforms and materials.',
      'Migrate on-premises infrastructure to cloud services for improved scalability and cost efficiency.',
      'Build a centralized data analytics platform to improve business intelligence capabilities.'
    ];
    
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    const projects = [];
    
    for (let i = 0; i < Math.min(count, projectNames.length); i++) {
      // Random progress between 0 and 100
      const progress = Math.floor(Math.random() * 101);
      
      // Status based on progress
      let status;
      if (progress === 0) {
        status = 'Not Started';
      } else if (progress === 100) {
        status = 'Completed';
      } else {
        status = 'In Progress';
      }
      
      // Random dates
      const today = new Date();
      const createdAt = randomDate(
        new Date(today.getFullYear(), today.getMonth() - 3, 1),
        new Date(today.getFullYear(), today.getMonth() - 1, 1)
      );
      
      const deadline = randomDate(
        new Date(today.getFullYear(), today.getMonth() + 1, 1),
        new Date(today.getFullYear(), today.getMonth() + 3, 1)
      );
      
      // Random team and task counts
      const teams = Math.floor(Math.random() * 4) + 1;
      const tasks = Math.floor(Math.random() * 20) + 5;
      
      // Generate random stakeholders
      const stakeholders = [];
      const stakeholderCount = Math.floor(Math.random() * 3) + 1;
      const selectedUserIds = [...userIds].sort(() => Math.random() - 0.5).slice(0, stakeholderCount);
      
      let totalPercentage = 100;
      for (let j = 0; j < selectedUserIds.length; j++) {
        const userId = selectedUserIds[j];
        let percentage;
        
        if (j === selectedUserIds.length - 1) {
          percentage = totalPercentage;
        } else {
          percentage = Math.floor(Math.random() * (totalPercentage - 10)) + 10;
          totalPercentage -= percentage;
        }
        
        stakeholders.push({
          id: generateId('stake-'),
          userId,
          userName: `User ${userId.replace('user-', '')}`, // Placeholder, should be replaced with actual user names
          percentage,
          role: j === 0 ? 'Project Manager' : 'Contributor'
        });
      }
      
      projects.push({
        id: generateId('proj-'),
        name: projectNames[i],
        description: projectDescriptions[i],
        progress,
        status,
        createdAt: formatDate(createdAt, 'iso'),
        deadline: formatDate(deadline, 'iso'),
        teams,
        tasks,
        stakeholders
      });
    }
    
    return projects;
  };
  
  // Generate tasks
  export const generateTasks = (projectIds, userIds, count = 15) => {
    const taskTitles = [
      'Design homepage mockup',
      'Implement authentication',
      'Create content for social media',
      'Optimize database queries',
      'Fix navigation menu',
      'Design email templates',
      'Update privacy policy',
      'Prepare quarterly report',
      'Setup analytics tracking',
      'Create user documentation',
      'Implement search functionality',
      'Fix responsive layout issues',
      'Optimize images for web',
      'Write API documentation',
      'Setup CI/CD pipeline'
    ];
    
    const priorities = ['High', 'Medium', 'Low'];
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    const tasks = [];
    
    for (let i = 0; i < count; i++) {
      const title = i < taskTitles.length ? taskTitles[i] : `Task ${i + 1}`;
      const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Random dates
      const today = new Date();
      const createdAt = randomDate(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        today
      );
      
      const deadline = randomDate(
        today,
        new Date(today.getFullYear(), today.getMonth() + 1, 15)
      );
      
      // Randomly assign to a user
      const assignedToId = userIds[Math.floor(Math.random() * userIds.length)];
      
      // Maybe add subtasks
      const subtasks = [];
      if (Math.random() > 0.5) {
        const subtaskCount = Math.floor(Math.random() * 4) + 1;
        for (let j = 0; j < subtaskCount; j++) {
          subtasks.push({
            id: generateId('subtask-'),
            title: `Subtask ${j + 1} for ${title}`,
            completed: Math.random() > 0.5
          });
        }
      }
      
      tasks.push({
        id: generateId('task-'),
        title,
        description: `This is a description for "${title}"`,
        projectId,
        project: `Project ${projectId.replace('proj-', '')}`, // Placeholder, should be replaced with actual project names
        deadline: formatDate(deadline, 'iso'),
        status,
        priority,
        completed: status === 'Completed',
        assignedType: 'user',
        assignedTo: {
          type: 'user',
          id: assignedToId,
          name: `User ${assignedToId.replace('user-', '')}` // Placeholder, should be replaced with actual user names
        },
        createdAt: formatDate(createdAt, 'iso'),
        updatedAt: formatDate(createdAt, 'iso'),
        comments: [],
        attachments: [],
        subtasks
      });
    }
    
    return tasks;
  };
  
  // Generate notifications
  export const generateNotifications = (projectIds, count = 8) => {
    const notificationTypes = [
      'task_assigned',
      'comment',
      'task_completed',
      'project_update',
      'mention',
      'task_due'
    ];
    
    const notificationMessages = {
      task_assigned: [
        'assigned you a new task "Design landing page"',
        'added you to task "Create wireframes"',
        'assigned you a new task "Update privacy policy"'
      ],
      comment: [
        'commented on "Optimize database queries"',
        'replied to your comment on "Create content calendar"',
        'commented on "Fix navigation menu"'
      ],
      task_completed: [
        'Your task "Set up development environment" was approved',
        'Task "Create homepage mockup" was marked as completed',
        'Your task "Implement login form" is approved'
      ],
      project_update: [
        'Project deadline has been extended to next month',
        'Project status updated to "In Progress"',
        'New milestone added to project'
      ],
      mention: [
        'mentioned you in a comment on "Create content for social media"',
        'tagged you in a document',
        'mentioned you in a task description'
      ],
      task_due: [
        'Task is due tomorrow',
        'Task deadline approaching in 2 days',
        'Task is overdue by 1 day'
      ]
    };
    
    const timeframes = [
      '5 minutes ago',
      '30 minutes ago',
      '1 hour ago',
      '2 hours ago',
      '3 hours ago',
      '5 hours ago',
      '1 day ago',
      '2 days ago'
    ];
    
    const notifications = [];
    
    for (let i = 0; i < count; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const messageOptions = notificationMessages[type];
      const message = messageOptions[Math.floor(Math.random() * messageOptions.length)];
      const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
      const time = timeframes[Math.floor(Math.random() * timeframes.length)];
      const read = i >= 2; // First two are unread
      
      const userName = type === 'task_assigned' || type === 'comment' || type === 'mention' 
        ? ['John Doe', 'Sarah Miller', 'Michael Chen'][Math.floor(Math.random() * 3)]
        : '';
      
      const fullMessage = userName 
        ? `${userName} ${message}`
        : message;
      
      notifications.push({
        id: generateId('notification-'),
        type,
        message: fullMessage,
        project: `Project ${projectId.replace('proj-', '')}`, // Placeholder
        time,
        read
      });
    }
    
    return notifications;
  };
  
  // Generate analytics data
  export const generateAnalyticsData = () => {
    return {
      taskCompletionRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      taskCompletionChange: `${Math.floor(Math.random() * 15) + 5}%`, // 5-20%
      activeProjects: Math.floor(Math.random() * 4) + 3, // 3-7
      activeProjectsChange: String(Math.floor(Math.random() * 3) + 1), // 1-3
      onTimeCompletion: Math.floor(Math.random() * 20) + 75, // 75-95%
      onTimeCompletionChange: `${Math.floor(Math.random() * 10) + 1}%`, // 1-10%
      teamProductivity: Math.floor(Math.random() * 15) + 80, // 80-95%
      teamProductivityChange: `${Math.floor(Math.random() * 10) + 5}%`, // 5-15%
      
      taskStatusDistribution: [
        { name: 'Completed', value: Math.floor(Math.random() * 100) + 100 }, // 100-200
        { name: 'In Progress', value: Math.floor(Math.random() * 50) + 40 }, // 40-90
        { name: 'Not Started', value: Math.floor(Math.random() * 30) + 10 }, // 10-40
      ],
      
      projectProgress: [
        { name: 'Website Redesign', progress: Math.floor(Math.random() * 30) + 50 }, // 50-80%
        { name: 'Mobile App Development', progress: Math.floor(Math.random() * 30) + 20 }, // 20-50%
        { name: 'Marketing Campaign', progress: Math.floor(Math.random() * 15) + 80 }, // 80-95%
        { name: 'Product Launch', progress: Math.floor(Math.random() * 30) + 30 }, // 30-60%
        { name: 'Office Relocation', progress: 100 }, // Completed
      ],
      
      teamPerformance: [
        { name: 'Design Team', tasksCompleted: Math.floor(Math.random() * 20) + 35, onTime: Math.floor(Math.random() * 15) + 30 },
        { name: 'Development Team', tasksCompleted: Math.floor(Math.random() * 20) + 55, onTime: Math.floor(Math.random() * 15) + 50 },
        { name: 'Marketing Team', tasksCompleted: Math.floor(Math.random() * 10) + 25, onTime: Math.floor(Math.random() * 5) + 22 },
      ],
      
      taskCompletionTrend: Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        return {
          date: `${month} ${day}`,
          completed: Math.floor(Math.random() * 10) + 5 // 5-15
        };
      }),
      
      projectByPriority: [
        { name: 'High', value: Math.floor(Math.random() * 10) + 20 }, // 20-30
        { name: 'Medium', value: Math.floor(Math.random() * 15) + 35 }, // 35-50
        { name: 'Low', value: Math.floor(Math.random() * 10) + 15 }, // 15-25
      ],
    };
  };
  
  // Generate complete dataset
  export const generateFullDataset = () => {
    const users = generateUsers(15);
    const userIds = users.map(user => user.id);
    
    const projects = generateProjects(userIds, 5);
    const projectIds = projects.map(project => project.id);
    
    const tasks = generateTasks(projectIds, userIds, 20);
    const notifications = generateNotifications(projectIds, 8);
    const analyticsData = generateAnalyticsData();
    
    return {
      users,
      projects,
      tasks,
      notifications,
      analyticsData
    };
  };
  
  export default {
    generateId,
    randomDate,
    formatDate,
    generateUsers,
    generateProjects,
    generateTasks,
    generateNotifications,
    generateAnalyticsData,
    generateFullDataset
  };