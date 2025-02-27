-- Default roles for the project management system
INSERT INTO roles (role_id, role_name, is_admin, description, created_at) VALUES 
(1, 'System Administrator', TRUE, 'Full system access with all privileges', NOW()),
(2, 'Project Manager', FALSE, 'Can create and manage projects', NOW()),
(3, 'Developer', FALSE, 'Standard developer role with task management abilities', NOW()),
(4, 'Designer', FALSE, 'Design team member with task management abilities', NOW()),
(5, 'Client', FALSE, 'External client with limited view access', NOW()),
(6, 'QA Tester', FALSE, 'Quality assurance team member', NOW()),
(7, 'Team Lead', FALSE, 'Team leader with elevated project permissions', NOW()),
(8, 'Stakeholder', FALSE, 'Internal stakeholder with view access', NOW()),
(9, 'Guest', FALSE, 'Limited view-only access', NOW());

-- Default admin settings
INSERT INTO admin_settings (setting_key, setting_value, category, description, data_type) VALUES
('default_user_role', '3', 'users', 'Default role assigned to new users', 'number'),
('allow_self_registration', 'false', 'security', 'Allow users to register accounts', 'boolean'),
('default_project_board_type', 'Kanban', 'projects', 'Default board type for new projects', 'string'),
('max_file_upload_size', '10', 'system', 'Maximum file upload size in MB', 'number'),
('enable_time_tracking', 'true', 'features', 'Enable time tracking functionality', 'boolean'),
('default_task_reminder_days', '1', 'tasks', 'Days before deadline to send reminder', 'number'),
('company_name', 'Your Company', 'branding', 'Company name for emails and reports', 'string'),
('company_logo_url', '/assets/logo.png', 'branding', 'URL to company logo', 'string');