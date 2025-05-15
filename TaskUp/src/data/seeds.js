// src/data/seeds.js
// Central location for all seed/mock data in the application

// Users seed data
export const users = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'Project Manager', avatar: null, lastLogin: '2025-04-02T14:30:00Z', createdAt: '2024-12-15T09:00:00Z' },
    { id: '2', firstName: 'Sarah', lastName: 'Miller', email: 'sarah.miller@example.com', role: 'UI Designer', avatar: null, lastLogin: '2025-04-01T10:15:00Z', createdAt: '2025-01-05T11:20:00Z' },
    { id: '3', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', role: 'UX Researcher', avatar: null, lastLogin: '2025-04-03T09:45:00Z', createdAt: '2025-01-10T13:30:00Z' },
    { id: '4', firstName: 'Emily', lastName: 'Wong', email: 'emily.wong@example.com', role: 'Graphic Designer', avatar: null, lastLogin: '2025-04-02T16:20:00Z', createdAt: '2025-01-12T10:00:00Z' },
    { id: '5', firstName: 'Alex', lastName: 'Johnson', email: 'alex.johnson@example.com', role: 'Tech Lead', avatar: null, lastLogin: '2025-04-01T11:30:00Z', createdAt: '2024-12-20T14:15:00Z' },
    { id: '6', firstName: 'Lisa', lastName: 'Park', email: 'lisa.park@example.com', role: 'Frontend Developer', avatar: null, lastLogin: '2025-04-03T13:10:00Z', createdAt: '2025-01-08T09:45:00Z' },
    { id: '7', firstName: 'David', lastName: 'Garcia', email: 'david.garcia@example.com', role: 'Backend Developer', avatar: null, lastLogin: '2025-04-02T15:30:00Z', createdAt: '2025-01-15T11:20:00Z' },
    { id: '8', firstName: 'Olivia', lastName: 'Kim', email: 'olivia.kim@example.com', role: 'Mobile Developer', avatar: null, lastLogin: '2025-04-01T14:20:00Z', createdAt: '2025-01-20T10:10:00Z' },
    { id: '9', firstName: 'Ryan', lastName: 'Martinez', email: 'ryan.martinez@example.com', role: 'QA Engineer', avatar: null, lastLogin: '2025-04-03T10:45:00Z', createdAt: '2025-01-18T13:30:00Z' },
    { id: '10', firstName: 'Jessica', lastName: 'Lee', email: 'jessica.lee@example.com', role: 'Marketing Manager', avatar: null, lastLogin: '2025-04-02T12:15:00Z', createdAt: '2024-12-28T15:40:00Z' },
    { id: '11', firstName: 'Brian', lastName: 'Wilson', email: 'brian.wilson@example.com', role: 'Content Creator', avatar: null, lastLogin: '2025-04-01T09:30:00Z', createdAt: '2025-01-25T14:10:00Z' },
    { id: '12', firstName: 'Amanda', lastName: 'Taylor', email: 'amanda.taylor@example.com', role: 'Social Media Specialist', avatar: null, lastLogin: '2025-04-03T11:20:00Z', createdAt: '2025-01-22T09:30:00Z' },
    { id: '20', firstName: 'Thomas', lastName: 'Wright', email: 'thomas.wright@example.com', role: 'UX Designer', avatar: null, lastLogin: '2025-04-01T16:45:00Z', createdAt: '2025-01-05T13:15:00Z' },
    { id: '21', firstName: 'Rachel', lastName: 'Green', email: 'rachel.green@example.com', role: 'Frontend Developer', avatar: null, lastLogin: '2025-04-02T08:30:00Z', createdAt: '2025-01-10T10:30:00Z' },
    { id: '22', firstName: 'Carlos', lastName: 'Rodriguez', email: 'carlos.rodriguez@example.com', role: 'Product Manager', avatar: null, lastLogin: '2025-04-03T14:15:00Z', createdAt: '2024-12-18T11:45:00Z' },
    { id: '23', firstName: 'Sophia', lastName: 'Chen', email: 'sophia.chen@example.com', role: 'Data Analyst', avatar: null, lastLogin: '2025-04-01T13:20:00Z', createdAt: '2025-01-17T09:20:00Z' },
    { id: '24', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@example.com', role: 'Backend Developer', avatar: null, lastLogin: '2025-04-02T10:10:00Z', createdAt: '2025-01-14T14:30:00Z' }
  ];
  
  // Projects seed data
  export const projects = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Completely revamp the company website with modern design principles and improved UX.',
      progress: 65,
      deadline: '2025-05-15',
      status: 'In Progress',
      createdAt: '2025-03-01',
      teams: 2,
      tasks: 12,
      scope: {
        included: "- Full redesign of all customer-facing pages\n- Mobile responsiveness\n- Integration with existing backend APIs\n- SEO optimization\n- Performance optimization",
        excluded: "- Backend development\n- Content creation\n- Hosting migration",
        startDate: '2025-03-15',
        endDate: '2025-06-30'
      },
      stakeholders: [
        { id: '1', userId: '1', userName: 'John Doe', percentage: 40, role: 'Project Manager' },
        { id: '2', userId: '2', userName: 'Sarah Miller', percentage: 30, role: 'Lead Designer' },
        { id: '3', userId: '3', userName: 'Michael Chen', percentage: 20, role: 'UX Designer' },
        { id: '4', userId: '4', userName: 'Emily Wong', percentage: 10, role: 'Graphic Designer' }
      ]
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Create native iOS and Android applications with core functionality from our web platform.',
      progress: 30,
      deadline: '2025-06-30',
      status: 'In Progress',
      createdAt: '2025-02-15',
      teams: 3,
      tasks: 24,
      scope: {
        included: "- User authentication\n- Core features from web app\n- Offline mode\n- Push notifications\n- Analytics integration",
        excluded: "- Payment processing\n- Social media sharing\n- Deep linking",
        startDate: '2025-02-20',
        endDate: '2025-07-15'
      },
      stakeholders: [
        { id: '5', userId: '5', userName: 'Alex Johnson', percentage: 35, role: 'Tech Lead' },
        { id: '6', userId: '6', userName: 'Lisa Park', percentage: 25, role: 'Frontend Developer' },
        { id: '7', userId: '7', userName: 'David Garcia', percentage: 25, role: 'Backend Developer' },
        { id: '8', userId: '8', userName: 'Olivia Kim', percentage: 15, role: 'Mobile Developer' }
      ]
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      description: 'Launch Q2 marketing campaign across digital and traditional channels to increase brand awareness.',
      progress: 85,
      deadline: '2025-04-20',
      status: 'In Progress',
      createdAt: '2025-03-05',
      teams: 1,
      tasks: 8,
      scope: {
        included: "- Social media campaign\n- Email newsletters\n- Display advertising\n- Content marketing\n- Analytics and reporting",
        excluded: "- Television ads\n- Radio spots\n- Print media",
        startDate: '2025-03-10',
        endDate: '2025-05-01'
      },
      stakeholders: [
        { id: '9', userId: '10', userName: 'Jessica Lee', percentage: 50, role: 'Marketing Manager' },
        { id: '10', userId: '11', userName: 'Brian Wilson', percentage: 30, role: 'Content Creator' },
        { id: '11', userId: '12', userName: 'Amanda Taylor', percentage: 20, role: 'Social Media Specialist' }
      ]
    },
    {
      id: '4',
      name: 'Product Launch',
      description: 'Coordinate the launch of our new flagship product including PR, marketing, and sales training.',
      progress: 40,
      deadline: '2025-07-10',
      status: 'Not Started',
      createdAt: '2025-03-15',
      teams: 4,
      tasks: 16,
      scope: {
        included: "- Product positioning\n- Launch event\n- Press releases\n- Sales enablement\n- Customer onboarding",
        excluded: "- Product development\n- Packaging design\n- Localization",
        startDate: '2025-04-01',
        endDate: '2025-07-15'
      },
      stakeholders: [
        { id: '12', userId: '22', userName: 'Carlos Rodriguez', percentage: 45, role: 'Product Manager' },
        { id: '13', userId: '10', userName: 'Jessica Lee', percentage: 30, role: 'Marketing Manager' },
        { id: '14', userId: '1', userName: 'John Doe', percentage: 25, role: 'Project Manager' }
      ]
    },
    {
      id: '5',
      name: 'Office Relocation',
      description: 'Plan and execute the move to our new headquarters with minimal disruption to operations.',
      progress: 100,
      deadline: '2025-03-01',
      status: 'Completed',
      createdAt: '2024-12-15',
      teams: 2,
      tasks: 20,
      scope: {
        included: "- Space planning\n- IT infrastructure setup\n- Furniture procurement\n- Employee communication\n- Move logistics",
        excluded: "- Architectural changes\n- Brand signage\n- Office decoration",
        startDate: '2025-01-01',
        endDate: '2025-03-01'
      },
      stakeholders: [
        { id: '15', userId: '1', userName: 'John Doe', percentage: 60, role: 'Project Manager' },
        { id: '16', userId: '5', userName: 'Alex Johnson', percentage: 20, role: 'IT Infrastructure Lead' },
        { id: '17', userId: '23', userName: 'Sophia Chen', percentage: 20, role: 'Logistics Coordinator' }
      ]
    },
    {
      id: '6',
      name: 'Sales Training Program',
      description: 'Develop and implement a comprehensive training program for the sales team on new products.',
      progress: 55,
      deadline: '2025-05-20',
      status: 'In Progress',
      createdAt: '2025-03-01',
      teams: 2,
      tasks: 15,
      scope: {
        included: "- Training materials development\n- Product workshops\n- Sales techniques\n- Customer objection handling\n- CRM system training",
        excluded: "- Individual coaching\n- Sales incentive program\n- Customer success training",
        startDate: '2025-03-15',
        endDate: '2025-05-25'
      },
      stakeholders: [
        { id: '18', userId: '22', userName: 'Carlos Rodriguez', percentage: 40, role: 'Product Manager' },
        { id: '19', userId: '11', userName: 'Brian Wilson', percentage: 35, role: 'Training Lead' },
        { id: '20', userId: '1', userName: 'John Doe', percentage: 25, role: 'Project Manager' }
      ]
    }
  ];
  
  // Tasks seed data
  export const tasks = [
    { 
      id: '1', 
      title: 'Design homepage mockup', 
      project: 'Website Redesign',
      projectId: '1',
      description: 'Create a modern, responsive design for the new homepage following the brand guidelines.',
      deadline: '2025-04-10', 
      status: 'In Progress', 
      priority: 'High',
      completed: false,
      assignedType: 'user',
      assignedTo: { type: 'user', id: '1', name: 'John Doe' },
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
    },
    { 
      id: '2', 
      title: 'Implement authentication', 
      project: 'Mobile App Development',
      projectId: '2',
      description: 'Implement secure authentication with social login options and two-factor authentication.',
      deadline: '2025-04-12', 
      status: 'Not Started', 
      priority: 'Medium',
      completed: false,
      assignedType: 'team',
      assignedTo: { type: 'team', id: '2', name: 'Development Team' },
      createdAt: '2025-03-20',
      updatedAt: '2025-03-25',
      comments: [],
      attachments: [],
      subtasks: [
        {
          id: '5',
          title: 'Setup auth service',
          completed: false
        },
        {
          id: '6',
          title: 'Implement login flow',
          completed: false
        },
        {
          id: '7',
          title: 'Add social login integrations',
          completed: false
        },
        {
          id: '8',
          title: 'Implement 2FA',
          completed: false
        }
      ]
    },
    { 
      id: '3', 
      title: 'Create content for social media', 
      project: 'Marketing Campaign',
      projectId: '3',
      description: 'Develop engaging content for our social media platforms to support the new campaign.',
      deadline: '2025-04-08', 
      status: 'Completed', 
      priority: 'High',
      completed: true,
      assignedType: 'team',
      assignedTo: { type: 'team', id: '3', name: 'Marketing Team' },
      createdAt: '2025-03-10',
      updatedAt: '2025-04-01',
      comments: [],
      attachments: [],
      subtasks: [
        {
          id: '9',
          title: 'Develop content calendar',
          completed: true
        },
        {
          id: '10',
          title: 'Create graphic assets',
          completed: true
        },
        {
          id: '11',
          title: 'Write copy for posts',
          completed: true
        },
        {
          id: '12',
          title: 'Schedule posts',
          completed: true
        }
      ]
    },
    { 
      id: '4', 
      title: 'Optimize database queries', 
      project: 'Mobile App Development',
      projectId: '2',
      description: 'Optimize the database queries to improve application performance and reduce load times.',
      deadline: '2025-04-15', 
      status: 'In Progress', 
      priority: 'Low',
      completed: false,
      assignedType: 'user',
      assignedTo: { type: 'user', id: '7', name: 'David Garcia' },
      createdAt: '2025-03-25',
      updatedAt: '2025-04-03',
      comments: [],
      attachments: [],
      subtasks: []
    },
    { 
      id: '5', 
      title: 'Fix navigation menu', 
      project: 'Website Redesign',
      projectId: '1',
      description: 'Fix navigation menu issues on mobile devices and ensure it\'s accessible.',
      deadline: '2025-04-11', 
      status: 'Not Started', 
      priority: 'Medium',
      completed: false,
      assignedType: 'user',
      assignedTo: { type: 'user', id: '6', name: 'Lisa Park' },
      createdAt: '2025-03-30',
      updatedAt: '2025-03-30',
      comments: [],
      attachments: [],
      subtasks: []
    },
    { 
      id: '6', 
      title: 'Design email templates', 
      project: 'Marketing Campaign',
      projectId: '3',
      description: 'Create responsive email templates for the marketing campaign.',
      deadline: '2025-04-09', 
      status: 'In Progress', 
      priority: 'Medium',
      completed: false,
      assignedType: 'team',
      assignedTo: { type: 'team', id: '3', name: 'Marketing Team' },
      createdAt: '2025-03-15',
      updatedAt: '2025-04-01',
      comments: [],
      attachments: [],
      subtasks: []
    },
    { 
      id: '7', 
      title: 'Update privacy policy', 
      project: 'Website Redesign',
      projectId: '1',
      description: 'Review and update the privacy policy to comply with new regulations.',
      deadline: '2025-04-20', 
      status: 'Not Started', 
      priority: 'Low',
      completed: false,
      assignedType: 'user',
      assignedTo: { type: 'user', id: '3', name: 'Michael Chen' },
      createdAt: '2025-03-28',
      updatedAt: '2025-03-28',
      comments: [],
      attachments: [],
      subtasks: []
    },
    { 
      id: '8', 
      title: 'Prepare Q2 marketing report', 
      project: 'Marketing Campaign',
      projectId: '3',
      description: 'Compile and analyze marketing metrics for Q2 and prepare a comprehensive report.',
      deadline: '2025-04-30', 
      status: 'Not Started', 
      priority: 'High',
      completed: false,
      assignedType: 'user',
      assignedTo: { type: 'user', id: '10', name: 'Jessica Lee' },
      createdAt: '2025-04-01',
      updatedAt: '2025-04-01',
      comments: [],
      attachments: [],
      subtasks: []
    }
  ];
  
  // Teams seed data
  export const teams = [
    {
      id: '1',
      name: 'Design Team',
      projectName: 'Website Redesign',
      projectId: '1',
      description: 'Responsible for UI/UX design, visual elements, and overall user experience of the website.',
      createdDate: 'Apr 2, 2025',
      colorIndex: 0, // Blue
      members: [
        { id: '1', name: 'John Doe', role: 'Team Lead', joinedDate: 'Apr 2, 2025', isLeader: true },
        { id: '2', name: 'Sarah Miller', role: 'UI Designer', joinedDate: 'Apr 3, 2025' },
        { id: '3', name: 'Michael Chen', role: 'UX Researcher', joinedDate: 'Apr 5, 2025' },
        { id: '4', name: 'Emily Wong', role: 'Graphic Designer', joinedDate: 'Apr 7, 2025' }
      ],
      tasks: [
        { id: '1', title: 'Design homepage mockup', status: 'In Progress' },
        { id: '5', title: 'Fix navigation menu', status: 'Not Started' }
      ]
    },
    {
      id: '2',
      name: 'Development Team',
      projectName: 'Mobile App Development',
      projectId: '2',
      description: 'Frontend and backend developers working on the mobile application architecture, features, and performance.',
      createdDate: 'Apr 3, 2025',
      colorIndex: 1, // Purple
      members: [
        { id: '5', name: 'Alex Johnson', role: 'Tech Lead', joinedDate: 'Apr 3, 2025', isLeader: true },
        { id: '6', name: 'Lisa Park', role: 'Frontend Developer', joinedDate: 'Apr 4, 2025' },
        { id: '7', name: 'David Garcia', role: 'Backend Developer', joinedDate: 'Apr 4, 2025' },
        { id: '8', name: 'Olivia Kim', role: 'Mobile Developer', joinedDate: 'Apr 5, 2025' },
        { id: '9', name: 'Ryan Martinez', role: 'QA Engineer', joinedDate: 'Apr 6, 2025' }
      ],
      tasks: [
        { id: '2', title: 'Implement authentication', status: 'Not Started' },
        { id: '4', title: 'Optimize database queries', status: 'In Progress' }
      ]
    },
    {
      id: '3',
      name: 'Marketing Team',
      projectName: 'Marketing Campaign',
      projectId: '3',
      description: 'Responsible for planning and executing marketing strategies, content creation, and campaign analytics.',
      createdDate: 'Apr 5, 2025',
      colorIndex: 2, // Green
      members: [
        { id: '10', name: 'Jessica Lee', role: 'Marketing Manager', joinedDate: 'Apr 5, 2025', isLeader: true },
        { id: '11', name: 'Brian Wilson', role: 'Content Creator', joinedDate: 'Apr 6, 2025' },
        { id: '12', name: 'Amanda Taylor', role: 'Social Media Specialist', joinedDate: 'Apr 7, 2025' }
      ],
      tasks: [
        { id: '3', title: 'Create content for social media', status: 'Completed' },
        { id: '6', title: 'Design email templates', status: 'In Progress' },
        { id: '8', title: 'Prepare Q2 marketing report', status: 'Not Started' }
      ]
    }
  ];
  
  // Notifications seed data
  export const notifications = [
    { 
      id: '1', 
      type: 'task_assigned', 
      message: 'John Doe assigned you a new task "Design landing page"', 
      project: 'Website Redesign',
      time: '5 minutes ago', 
      read: false 
    },
    { 
      id: '2', 
      type: 'comment', 
      message: 'Sarah Miller commented on "Optimize database queries"', 
      project: 'Mobile App Development',
      time: '1 hour ago', 
      read: false 
    },
    { 
      id: '3', 
      type: 'task_completed', 
      message: 'Your task "Set up development environment" was approved', 
      project: 'Mobile App Development',
      time: '3 hours ago', 
      read: true 
    },
    { 
      id: '4', 
      type: 'project_update', 
      message: 'Project "Website Redesign" deadline has been extended to May 25', 
      project: 'Website Redesign',
      time: '5 hours ago', 
      read: true 
    },
    { 
      id: '5', 
      type: 'task_assigned', 
      message: 'Michael Chen assigned you a new task "Update privacy policy"', 
      project: 'Website Redesign',
      time: '1 day ago', 
      read: true 
    },
    { 
      id: '6', 
      type: 'comment', 
      message: 'Jennifer Lee commented on "Fix navigation menu"', 
      project: 'Website Redesign',
      time: '1 day ago', 
      read: true 
    },
    { 
      id: '7', 
      type: 'mention', 
      message: 'Lisa Park mentioned you in a comment on "Create content for social media"', 
      project: 'Marketing Campaign',
      time: '2 days ago', 
      read: true 
    },
    { 
      id: '8', 
      type: 'task_due', 
      message: 'Task "Implement authentication" is due tomorrow', 
      project: 'Mobile App Development',
      time: '2 days ago', 
      read: true 
    }
  ];
  
  // Chat messages seed data
  export const chatMessages = [
    {
      id: '1',
      user: { id: '2', name: 'John Doe' },
      content: "Hi team! I've just pushed the latest changes to the repository. Please check and let me know if you have any feedback.",
      time: '10:30 AM',
      own: false
    },
    {
      id: '2',
      user: { id: '3', name: 'Sarah Miller' },
      content: "Great! I'll take a look at it this afternoon.",
      time: '10:45 AM',
      own: false
    },
    {
      id: '3',
      user: { id: '1', name: 'You' },
      content: "Thanks for the update. I've been working on the design mockups and should have them ready by EOD.",
      time: '11:15 AM',
      own: true
    },
    {
      id: '4',
      user: { id: '4', name: 'Michael Chen' },
      content: "I'm reviewing the API documentation now. There are a few endpoints we need to discuss in the next meeting.",
      time: '11:32 AM',
      own: false
    },
    {
      id: '5',
      user: { id: '2', name: 'John Doe' },
      content: "Sounds good. I'll add it to the meeting agenda.",
      time: '11:40 AM',
      own: false
    }
  ];
  
  // Analytics data
  export const analyticsData = {
    taskCompletionRate: 78,
    taskCompletionChange: '12%',
    activeProjects: 5,
    activeProjectsChange: '2',
    onTimeCompletion: 82,
    onTimeCompletionChange: '5%',
    teamProductivity: 91,
    teamProductivityChange: '8%',
    
    taskStatusDistribution: [
      { name: 'Completed', value: 145 },
      { name: 'In Progress', value: 64 },
      { name: 'Not Started', value: 32 },
    ],
    
    projectProgress: [
      { name: 'Website Redesign', progress: 65 },
      { name: 'Mobile App Development', progress: 30 },
      { name: 'Marketing Campaign', progress: 85 },
      { name: 'Product Launch', progress: 40 },
      { name: 'Office Relocation', progress: 100 },
    ],
    
    teamPerformance: [
      { name: 'Design Team', tasksCompleted: 45, onTime: 38 },
      { name: 'Development Team', tasksCompleted: 68, onTime: 62 },
      { name: 'Marketing Team', tasksCompleted: 32, onTime: 28 },
    ],
    
    taskCompletionTrend: [
      { date: 'Apr 1', completed: 8 },
      { date: 'Apr 2', completed: 5 },
      { date: 'Apr 3', completed: 7 },
      { date: 'Apr 4', completed: 10 },
      { date: 'Apr 5', completed: 12 },
      { date: 'Apr 6', completed: 8 },
      { date: 'Apr 7', completed: 9 },
      { date: 'Apr 8', completed: 11 },
      { date: 'Apr 9', completed: 14 },
      { date: 'Apr 10', completed: 16 },
      { date: 'Apr 11', completed: 12 },
      { date: 'Apr 12', completed: 10 },
      { date: 'Apr 13', completed: 8 },
      { date: 'Apr 14', completed: 9 },
    ],
    
    projectByPriority: [
      { name: 'High', value: 24 },
      { name: 'Medium', value: 45 },
      { name: 'Low', value: 19 },
    ],
  };
  
  // Team colors
  export const teamColors = [
    { primary: 'from-blue-500 to-blue-600', secondary: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
    { primary: 'from-purple-500 to-purple-600', secondary: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' },
    { primary: 'from-green-500 to-green-600', secondary: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' },
    { primary: 'from-yellow-500 to-yellow-600', secondary: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' },
    { primary: 'from-red-500 to-red-600', secondary: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300' },
    { primary: 'from-indigo-500 to-indigo-600', secondary: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' },
  ];
  
  // User activities
  export const userActivities = [
    { id: '1', type: 'task_completed', content: 'Completed "Design homepage mockup"', time: '1 day ago' },
    { id: '2', type: 'comment_added', content: 'Added a comment on "Mobile App Development"', time: '2 days ago' },
    { id: '3', type: 'project_created', content: 'Created project "Website Redesign"', time: '1 week ago' }
  ];
  
  // User stakes
  export const userStakes = [
    { id: '1', projectId: '1', projectName: 'Website Redesign', percentage: 40, role: 'Project Manager' },
    { id: '2', projectId: '2', projectName: 'Mobile App Development', percentage: 25, role: 'Lead Developer' },
    { id: '3', projectId: '3', projectName: 'Marketing Campaign', percentage: 15, role: 'Consultant' }
  ];
  
  // Helper function to get full name
  export const getFullName = (user) => {
    return `${user.firstName} ${user.lastName}`;
  };
  
  // Helper function to get random items from an array
  export const getRandomByIds = (collection, ids) => {
    return ids.map(id => collection.find(item => item.id === id)).filter(Boolean);
  };
  
  // Export all data as a default object for convenience
  export default {
    users,
    projects,
    tasks,
    teams,
    notifications,
    chatMessages,
    analyticsData,
    teamColors,
    userActivities,
    userStakes,
    getFullName,
    getRandomByIds
  };