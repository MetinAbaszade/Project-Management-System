-- Default task types for the project management system
INSERT INTO task_types (type_id, type_name, description, color, icon, created_at, is_active) VALUES
(1, 'Feature', 'New feature implementation', '#4CAF50', 'star', NOW(), TRUE),
(2, 'Bug', 'Software defect that needs fixing', '#F44336', 'bug_report', NOW(), TRUE),
(3, 'Task', 'General task or work item', '#2196F3', 'assignment', NOW(), TRUE),
(4, 'Story', 'User story for agile methodology', '#9C27B0', 'book', NOW(), TRUE),
(5, 'Epic', 'Large body of work that can be broken down', '#FF9800', 'dashboard', NOW(), TRUE),
(6, 'Documentation', 'Documentation related work', '#607D8B', 'description', NOW(), TRUE),
(7, 'Design', 'UI/UX design work', '#E91E63', 'palette', NOW(), TRUE),
(8, 'Research', 'Research and investigation', '#8BC34A', 'search', NOW(), TRUE),
(9, 'Testing', 'QA and testing activities', '#00BCD4', 'check_circle', NOW(), TRUE),
(10, 'Maintenance', 'Routine maintenance work', '#795548', 'build', NOW(), TRUE),
(11, 'Infrastructure', 'Infrastructure and DevOps tasks', '#673AB7', 'cloud', NOW(), TRUE),
(12, 'Security', 'Security-related tasks', '#FF5722', 'security', NOW(), TRUE),
(13, 'Performance', 'Performance optimization tasks', '#FFEB3B', 'speed', NOW(), TRUE);

-- Add some default board columns for each board type
INSERT INTO board_columns (board_id, name, order_index, task_status) VALUES
-- For Kanban boards (created for new projects)
(1, 'Backlog', 0, 'Backlog'),
(1, 'To Do', 1, 'Todo'),
(1, 'In Progress', 2, 'InProgress'),
(1, 'Review', 3, 'Review'),
(1, 'Done', 4, 'Done');