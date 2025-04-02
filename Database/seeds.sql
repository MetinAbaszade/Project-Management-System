-- Insert default languages
INSERT IGNORE INTO Languages (LanguageName, LanguageCode, DisplayOrder) VALUES
('JavaScript', 'js', 1),
('Python', 'py', 2),
('Java', 'java', 3),
('C#', 'cs', 4),
('PHP', 'php', 5),
('Ruby', 'rb', 6),
('TypeScript', 'ts', 7),
('Swift', 'swift', 8),
('Go', 'go', 9),
('Kotlin', 'kt', 10);


INSERT INTO admin_settings (setting_key, setting_value, category, description, data_type) VALUES
('default_task_due_days', '7', 'tasks', 'Default number of days for task deadlines', 'number'),
('allow_public_projects', 'false', 'security', 'Allow projects to be publicly viewable', 'boolean'),
('max_file_size_mb', '10', 'uploads', 'Maximum file size for uploads in MB', 'number'),
('system_maintenance_mode', 'false', 'system', 'Put system in maintenance mode', 'boolean'),
('default_user_role', '3', 'users', 'Default role ID for new users', 'number'),
('smtp_settings', '{"host":"smtp.example.com","port":587,"secure":true}', 'email', 'SMTP server settings', 'json'),
('password_policy', '{"min_length":8,"require_uppercase":true,"require_special":true}', 'security', 'Password requirements', 'json');
