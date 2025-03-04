CREATE TABLE admin_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    data_type ENUM('string', 'number', 'boolean', 'json', 'date') DEFAULT 'string',
    validation_regex VARCHAR(255),
    default_value TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

INSERT INTO admin_settings (setting_key, setting_value, category, description, data_type) VALUES
('default_task_due_days', '7', 'tasks', 'Default number of days for task deadlines', 'number'),
('allow_public_projects', 'false', 'security', 'Allow projects to be publicly viewable', 'boolean'),
('max_file_size_mb', '10', 'uploads', 'Maximum file size for uploads in MB', 'number'),
('system_maintenance_mode', 'false', 'system', 'Put system in maintenance mode', 'boolean'),
('default_user_role', '3', 'users', 'Default role ID for new users', 'number'),
('smtp_settings', '{"host":"smtp.example.com","port":587,"secure":true}', 'email', 'SMTP server settings', 'json'),
('password_policy', '{"min_length":8,"require_uppercase":true,"require_special":true}', 'security', 'Password requirements', 'json');