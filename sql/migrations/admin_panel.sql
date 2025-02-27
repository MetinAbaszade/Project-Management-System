-- Add admin panel related tables and modifications

-- Update roles table to include admin flag
ALTER TABLE roles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create admin settings table
CREATE TABLE admin_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create audit logs table
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    changes_made TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create system notifications table
CREATE TABLE system_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    severity ENUM('Info', 'Warning', 'Critical') DEFAULT 'Info',
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Update projects table to include owner
ALTER TABLE projects ADD COLUMN owner_id INT NOT NULL AFTER budget_used;
ALTER TABLE projects ADD FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE RESTRICT;

-- Update project_members table to include member type
ALTER TABLE project_members ADD COLUMN member_type ENUM('Owner', 'Collaborator') DEFAULT 'Collaborator' AFTER role_in_project;