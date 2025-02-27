-- Sample test data for development and testing purposes

-- Test users
INSERT INTO users (user_id, first_name, last_name, email, password, image_url, is_active, created_at) VALUES
(1, 'Admin', 'User', 'admin@example.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', '/assets/avatars/admin.jpg', TRUE, NOW()),
(2, 'Project', 'Manager', 'pm@example.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', '/assets/avatars/pm.jpg', TRUE, NOW()),
(3, 'John', 'Developer', 'john@example.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', '/assets/avatars/john.jpg', TRUE, NOW()),
(4, 'Jane', 'Designer', 'jane@example.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', '/assets/avatars/jane.jpg', TRUE, NOW()),
(5, 'Client', 'User', 'client@example.com', '$2a$10$hKDVYxLefVHV/vtuPhWD3OigtRyOykRLDdUAp80Z1crSoS1lFqaFS', '/assets/avatars/client.jpg', TRUE, NOW());

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
(1, 1, NOW()), -- Admin is System Administrator
(2, 2, NOW()), -- PM is Project Manager
(3, 3, NOW()), -- John is Developer
(4, 4, NOW()), -- Jane is Designer
(5, 5, NOW()); -- Client is Client

-- Sample projects
INSERT INTO projects (project_id, name, description, start_date, end_date, status, budget, budget_used, owner_id, is_public, created_at, estimated_hours) VALUES
(1, 'Website Redesign', 'Complete redesign of company website with new branding', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 90 DAY), 'Active', 25000.00, 5000.00, 2, FALSE, NOW(), 500),
(2, 'Mobile App Development', 'New mobile app for customer engagement', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 120 DAY), 'Active', 75000.00, 15000.00, 2, FALSE, NOW(), 1200),
(3, 'Internal Dashboard', 'Dashboard for internal performance tracking', DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 45 DAY), 'Active', 15000.00, 3000.00, 2, TRUE, NOW(), 300);

-- Project members
INSERT INTO project_members (project_id, user_id, role_in_project, member_type, total_hours_worked, hourly_rate, joined_at, invited_by) VALUES
-- Website Redesign
(1, 2, 'Project Manager', 'Owner', 45.5, 100.00, NOW(), 1),
(1, 3, 'Frontend Developer', 'Collaborator', 78.2, 75.00, NOW(), 2),
(1, 4, 'UI/UX Designer', 'Collaborator', 62.8, 85.00, NOW(), 2),
(1, 5, 'Stakeholder', 'Collaborator', 0, NULL, NOW(), 2),
-- Mobile App
(2, 2, 'Project Manager', 'Owner', 32.7, 100.00, NOW(), 1),
(2, 3, 'Mobile Developer', 'Collaborator', 120.5, 80.00, NOW(), 2),
(2, 4, 'UI Designer', 'Collaborator', 45.2, 85.00, NOW(), 2),
-- Internal Dashboard
(3, 2, 'Project Manager', 'Owner', 28.3, 100.00, NOW(), 1),
(3, 3, 'Full Stack Developer', 'Collaborator', 65.4, 75.00, NOW(), 2);

-- Sample tasks
INSERT INTO tasks (task_id, project_id, title, description, type, priority, status, created_by, assigned_to, created_at, deadline, estimated_hours, tags) VALUES
-- Website Redesign Tasks
(1, 1, 'Homepage Design', 'Create new homepage design based on brand guidelines', 7, 'High', 'Done', 2, 4, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY), 16, 'design,homepage'),
(2, 1, 'Responsive Navigation', 'Implement responsive navigation menu', 1, 'Medium', 'InProgress', 2, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY), 8, 'frontend,navigation'),
(3, 1, 'Contact Form', 'Create and style contact form with validation', 3, 'Medium', 'Todo', 2, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 21 DAY), 6, 'frontend,form'),
(4, 1, 'SEO Optimization', 'Optimize site for search engines', 3, 'Low', 'Backlog', 2, NULL, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY), 12, 'seo'),
-- Mobile App Tasks
(5, 2, 'User Authentication', 'Implement user login and registration', 1, 'Critical', 'InProgress', 2, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY), 20, 'auth,backend'),
(6, 2, 'App Icon Design', 'Design app icon and splash screen', 7, 'Medium', 'Done', 2, 4, NOW(), DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 4, 'design,branding'),
(7, 2, 'Push Notifications', 'Implement push notification system', 1, 'High', 'Todo', 2, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 15 DAY), 16, 'notifications,backend'),
-- Dashboard Tasks
(8, 3, 'Data Visualization', 'Create charts and graphs for key metrics', 1, 'High', 'InProgress', 2, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 10 DAY), 24, 'charts,frontend'),
(9, 3, 'User Permissions', 'Implement role-based access control', 12, 'Medium', 'Todo', 2, 3, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 20 DAY), 12, 'security,backend'),
(10, 3, 'Data Export', 'Add CSV and PDF export functionality', 3, 'Low', 'Backlog', 2, NULL, NOW(), DATE_ADD(CURRENT_DATE(), INTERVAL 25 DAY), 8, 'export,backend');

-- Sample time entries
INSERT INTO time_entries (task_id, user_id, time_spent, entry_date, description, billable) VALUES
-- Website Redesign Time
(1, 4, 14.5, DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 'Initial homepage mockups', TRUE),
(1, 4, 6.2, DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 'Revisions based on feedback', TRUE),
(2, 3, 3.5, DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'Navigation structure planning', TRUE),
(2, 3, 4.0, DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'Started implementation', TRUE),
-- Mobile App Time
(5, 3, 6.5, DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY), 'Authentication API integration', TRUE),
(5, 3, 5.0, DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), 'Login UI implementation', TRUE),
(6, 4, 4.0, DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY), 'App icon design', TRUE),
-- Dashboard Time
(8, 3, 8.5, DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 'Chart library research and setup', TRUE),
(8, 3, 6.0, DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'Implemented first set of charts', TRUE);

-- Sample sprints
INSERT INTO sprints (sprint_id, project_id, name, start_date, end_date, goal, status, capacity, created_by) VALUES
(1, 1, 'Sprint 1', DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY), DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'Complete initial designs and structure', 'Completed', 30, 2),
(2, 1, 'Sprint 2', CURRENT_DATE(), DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY), 'Implement core pages and navigation', 'Active', 24, 2),
(3, 2, 'Sprint 1', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), 'Basic app structure and design', 'Completed', 20, 2),
(4, 2, 'Sprint 2', DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), 'User authentication and profile', 'Active', 28, 2);

-- Sprint tasks
INSERT INTO sprint_tasks (sprint_id, task_id, added_by, story_points) VALUES
(1, 1, 2, 8), -- Homepage Design in Sprint 1
(2, 2, 2, 5), -- Responsive Navigation in Sprint 2
(2, 3, 2, 3), -- Contact Form in Sprint 2
(3, 6, 2, 2), -- App Icon Design in Sprint 1 (Mobile App)
(4, 5, 2, 13); -- User Authentication in Sprint 2 (Mobile App)

-- Sample comments
INSERT INTO comments (task_id, user_id, content, created_at) VALUES
(1, 2, 'Please make sure to follow the new brand guidelines for colors and typography.', DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)),
(1, 4, 'Initial designs are ready for review. I\'ve used the new color palette.', DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)),
(1, 2, 'Looks great! Just a few minor adjustments needed on the spacing.', DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)),
(5, 2, 'We need to ensure we\'re using secure storage for auth tokens.', DATE_SUB(CURRENT_DATE(), INTERVAL 9 DAY)),
(5, 3, 'I\'ll implement using the recommended security practices. Should we use biometric auth as well?', DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)),
(8, 2, 'Please use the Chart.js library for consistency with our other projects.', DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY));

-- Sample boards
INSERT INTO boards (board_id, project_id, name, board_type, is_default, created_by) VALUES
(1, 1, 'Website Development', 'Kanban', TRUE, 2),
(2, 2, 'Mobile App', 'Scrum', TRUE, 2),
(3, 3, 'Dashboard Development', 'Kanban', TRUE, 2);

-- Audit logs sample
INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, action_time, changes_made) VALUES
(1, 'CREATE', 'PROJECT', 1, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), '{"name":"Website Redesign", "budget":25000}'),
(2, 'CREATE', 'TASK', 1, DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY), '{"title":"Homepage Design"}'),
(2, 'ASSIGN', 'TASK', 1, DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY), '{"assigned_to":4}'),
(4, 'UPDATE_STATUS', 'TASK', 1, DATE_SUB(CURRENT_DATE(), INTERVAL 22 DAY), '{"old_status":"Todo", "new_status":"InProgress"}'),
(4, 'UPDATE_STATUS', 'TASK', 1, DATE_SUB(CURRENT_DATE(), INTERVAL 18 DAY), '{"old_status":"InProgress", "new_status":"Review"}'),
(2, 'UPDATE_STATUS', 'TASK', 1, DATE_SUB(CURRENT_DATE(), INTERVAL 15 DAY), '{"old_status":"Review", "new_status":"Done"}');