// src/utils/randomizer.js
// Utility functions for randomizing data

/**
 * Get a random item from an array
 * @param {Array} array - The array to pick from
 * @returns {*} A random item from the array
 */
export const getRandomItem = (array) => {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  };
  
  /**
   * Get multiple random items from an array
   * @param {Array} array - The array to pick from
   * @param {number} count - The number of items to pick
   * @param {boolean} allowDuplicates - Whether to allow duplicate items (default: false)
   * @returns {Array} An array of random items
   */
  export const getRandomItems = (array, count, allowDuplicates = false) => {
    if (!array || array.length === 0) return [];
    if (count >= array.length) return [...array];
    
    if (allowDuplicates) {
      return Array.from({ length: count }, () => getRandomItem(array));
    } else {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
  };
  
  /**
   * Get a random number within a range
   * @param {number} min - The minimum value
   * @param {number} max - The maximum value
   * @param {boolean} isInteger - Whether to return an integer (default: true)
   * @returns {number} A random number within the range
   */
  export const getRandomNumber = (min, max, isInteger = true) => {
    const random = Math.random() * (max - min) + min;
    return isInteger ? Math.floor(random) : random;
  };
  
  /**
   * Get a random date within a range
   * @param {Date|string} startDate - The start date
   * @param {Date|string} endDate - The end date
   * @param {string} format - The format to return ('iso', 'date', or 'string')
   * @returns {string|Date} A random date within the range
   */
  export const getRandomDate = (startDate, endDate, format = 'iso') => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    if (format === 'date') {
      return randomDate;
    } else if (format === 'string') {
      return randomDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      return randomDate.toISOString().split('T')[0]; // YYYY-MM-DD
    }
  };
  
  /**
   * Get a random boolean value with probability
   * @param {number} trueProbability - The probability of true (0-1)
   * @returns {boolean} A random boolean value
   */
  export const getRandomBoolean = (trueProbability = 0.5) => {
    return Math.random() < trueProbability;
  };
  
  /**
   * Generate a random ID
   * @param {string} prefix - The prefix to use
   * @returns {string} A random ID
   */
  export const generateRandomId = (prefix = '') => {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Filter an array based on a random probability
   * @param {Array} array - The array to filter
   * @param {number} probability - The probability of keeping an item (0-1)
   * @returns {Array} The filtered array
   */
  export const randomFilter = (array, probability = 0.5) => {
    return array.filter(() => getRandomBoolean(probability));
  };
  
  /**
   * Create a random subset of properties from an object
   * @param {Object} obj - The object to pick properties from
   * @param {Array} required - Array of keys that are required in the result
   * @param {number} probability - The probability of including optional properties (0-1)
   * @returns {Object} A new object with a random subset of properties
   */
  export const randomSubset = (obj, required = [], probability = 0.5) => {
    const result = {};
    
    // Include required properties
    required.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
    });
    
    // Include optional properties based on probability
    Object.keys(obj).forEach(key => {
      if (!required.includes(key) && getRandomBoolean(probability)) {
        result[key] = obj[key];
      }
    });
    
    return result;
  };
  
  /**
   * Get a shuffled copy of an array
   * @param {Array} array - The array to shuffle
   * @returns {Array} A shuffled copy of the array
   */
  export const shuffleArray = (array) => {
    return [...array].sort(() => 0.5 - Math.random());
  };
  
  /**
   * Generate mock data for projects
   * @param {Object} seedData - The seed data containing projects, users, etc.
   * @param {number} count - The number of projects to generate
   * @returns {Array} An array of generated projects
   */
  export const generateProjects = (seedData, count = 3) => {
    const projectNames = [
      'Website Redesign', 'Mobile App Development', 'Marketing Campaign',
      'Product Launch', 'Office Relocation', 'Sales Training Program',
      'CRM Implementation', 'Brand Refresh', 'Security Audit', 
      'Cloud Migration', 'Data Analytics Platform', 'Customer Portal'
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
      'Conduct a comprehensive security audit of all systems and implement recommended improvements.',
      'Migrate on-premises infrastructure to cloud services for improved scalability and cost efficiency.',
      'Build a centralized data analytics platform to improve business intelligence capabilities.',
      'Develop a self-service customer portal to enhance customer experience and reduce support load.'
    ];
    
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    
    return Array.from({ length: count }, (_, i) => {
      const nameIndex = i % projectNames.length;
      const name = projectNames[nameIndex];
      const description = projectDescriptions[nameIndex];
      
      const progress = getRandomNumber(0, 100);
      const status = progress === 100 ? 'Completed' : progress === 0 ? 'Not Started' : 'In Progress';
      
      const today = new Date();
      const startDate = getRandomDate(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 1)
      );
      
      const endDate = getRandomDate(
        new Date(today.getFullYear(), today.getMonth() + 1, 1),
        new Date(today.getFullYear(), today.getMonth() + 3, 1)
      );
      
      // Random stakeholders
      const stakeholderCount = getRandomNumber(1, 4);
      const stakeholders = getRandomItems(seedData.users, stakeholderCount)
        .map((user, index) => ({
          id: generateRandomId('sh-'),
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          percentage: index === 0 ? 40 : 20,
          role: user.role
        }));
      
      return {
        id: generateRandomId('proj-'),
        name,
        description,
        progress,
        deadline: endDate,
        status,
        createdAt: startDate,
        teams: getRandomNumber(1, 4),
        tasks: getRandomNumber(4, 20),
        scope: {
          included: "- Feature 1\n- Feature 2\n- Feature 3\n- Feature 4",
          excluded: "- Feature 5\n- Feature 6\n- Feature 7",
          startDate,
          endDate
        },
        stakeholders
      };
    });
  };
  
  /**
   * Generate mock data for tasks
   * @param {Object} seedData - The seed data containing projects, users, etc.
   * @param {number} count - The number of tasks to generate
   * @returns {Array} An array of generated tasks
   */
  export const generateTasks = (seedData, count = 5) => {
    const taskTitles = [
      'Design homepage mockup', 'Implement authentication', 'Create content for social media',
      'Optimize database queries', 'Fix navigation menu', 'Design email templates',
      'Update privacy policy', 'Prepare quarterly report', 'Configure CI/CD pipeline',
      'Test mobile responsiveness', 'Setup analytics tracking', 'Create user documentation'
    ];
    
    const priorities = ['High', 'Medium', 'Low'];
    const statuses = ['Not Started', 'In Progress', 'Completed'];
    
    return Array.from({ length: count }, (_, i) => {
      const title = i < taskTitles.length ? taskTitles[i] : `Task ${i + 1}`;
      const project = getRandomItem(seedData.projects);
      const status = getRandomItem(statuses);
      const priority = getRandomItem(priorities);
      
      const assignType = getRandomBoolean() ? 'user' : 'team';
      let assignedTo;
      
      if (assignType === 'user') {
        const user = getRandomItem(seedData.users);
        assignedTo = {
          type: 'user',
          id: user.id,
          name: `${user.firstName} ${user.lastName}`
        };
      } else {
        const team = getRandomItem(seedData.teams);
        assignedTo = {
          type: 'team',
          id: team.id,
          name: team.name
        };
      }
      
      const today = new Date();
      const createdAt = getRandomDate(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        today
      );
      
      const updatedAt = getRandomDate(
        new Date(createdAt),
        today
      );
      
      const deadline = getRandomDate(
        today,
        new Date(today.getFullYear(), today.getMonth() + 2, 1)
      );
      
      // Maybe add subtasks
      const hasSubtasks = getRandomBoolean(0.7);
      const subtasks = hasSubtasks ? Array.from({ length: getRandomNumber(2, 5) }, (_, j) => ({
        id: generateRandomId('subtask-'),
        title: `Subtask ${j + 1} for ${title}`,
        completed: getRandomBoolean()
      })) : [];
      
      return {
        id: generateRandomId('task-'),
        title,
        project: project.name,
        projectId: project.id,
        description: `This is a task related to ${project.name}: ${title}`,
        deadline,
        status,
        priority,
        completed: status === 'Completed',
        assignedType: assignType,
        assignedTo,
        createdAt,
        updatedAt,
        comments: [],
        attachments: [],
        subtasks
      };
    });
  };
  
  /**
   * Generate mock data for teams
   * @param {Object} seedData - The seed data containing projects, users, etc.
   * @param {number} count - The number of teams to generate
   * @returns {Array} An array of generated teams
   */
  export const generateTeams = (seedData, count = 3) => {
    const teamNames = [
      'Design Team', 'Development Team', 'Marketing Team',
      'QA Team', 'DevOps Team', 'Product Team',
      'UX Research Team', 'Content Team', 'Analytics Team'
    ];
    
    return Array.from({ length: count }, (_, i) => {
      const name = i < teamNames.length ? teamNames[i] : `Team ${i + 1}`;
      const project = getRandomItem(seedData.projects);
      const colorIndex = i % seedData.teamColors.length;
      
      // Get 2-5 random members
      const memberCount = getRandomNumber(2, 5);
      const teamMembers = getRandomItems(seedData.users, memberCount)
        .map((user, index) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          joinedDate: getRandomDate(
            new Date(new Date().setMonth(new Date().getMonth() - 1)),
            new Date(),
            'string'
          ).split(',')[0], // Remove year for shorter date
          isLeader: index === 0 // First user is leader
        }));
      
      // Get 0-3 random tasks
      const taskCount = getRandomNumber(0, 3);
      const teamTasks = getRandomItems(seedData.tasks, taskCount)
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status
        }));
      
      return {
        id: generateRandomId('team-'),
        name,
        projectName: project.name,
        projectId: project.id,
        description: `The ${name} is working on ${project.name}, focusing on ${name.toLowerCase().replace(' team', '')} related tasks.`,
        createdDate: getRandomDate(
          new Date(new Date().setMonth(new Date().getMonth() - 2)),
          new Date(),
          'string'
        ),
        colorIndex,
        members: teamMembers,
        tasks: teamTasks
      };
    });
  };
  
  export default {
    getRandomItem,
    getRandomItems,
    getRandomNumber,
    getRandomDate,
    getRandomBoolean,
    generateRandomId,
    randomFilter,
    randomSubset,
    shuffleArray,
    generateProjects,
    generateTasks,
    generateTeams
  };