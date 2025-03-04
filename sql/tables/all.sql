CREATE TABLE board_columns (
    column_id INT PRIMARY KEY AUTO_INCREMENT,
    board_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    order_index INT NOT NULL,
    wip_limit INT,
    task_status VARCHAR(20),
    description TEXT,
    color VARCHAR(7),
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE
);
CREATE TABLE boards (
    board_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    board_type ENUM('Kanban', 'Scrum', 'Custom') DEFAULT 'Kanban',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE sprint_tasks (
    sprint_id INT NOT NULL,
    task_id INT NOT NULL,
    added_by INT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    story_points FLOAT,
    PRIMARY KEY (sprint_id, task_id),
    FOREIGN KEY (sprint_id) REFERENCES sprints(sprint_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE sprints (
    sprint_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    goal TEXT,
    status ENUM('Planning', 'Active', 'Completed', 'Canceled') DEFAULT 'Planning',
    capacity FLOAT,
    velocity FLOAT,
    retrospective_notes TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);


CREATE TABLE languages (
    language_id INT PRIMARY KEY AUTO_INCREMENT,
    language_name VARCHAR(50) NOT NULL UNIQUE,
    language_code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0
);

-- Insert default languages
INSERT INTO languages (language_name, language_code, display_order) VALUES
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



CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);



CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    login_attempts INT DEFAULT 0,
    last_password_change DATETIME,
    require_password_change BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_email UNIQUE (email)
);

CREATE TABLE labels (
    label_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    project_id INT, -- NULL for global labels
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_label_project (name, project_id)
);

CREATE TABLE task_labels (
    task_id INT NOT NULL,
    label_id INT NOT NULL,
    added_by INT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, label_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(label_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100),
    content TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    link VARCHAR(255),
    source_user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (source_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);


CREATE TABLE system_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    severity ENUM('Info', 'Warning', 'Critical') DEFAULT 'Info',
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    is_dismissible BOOLEAN DEFAULT TRUE,
    target_roles VARCHAR(255), -- Comma-separated role IDs
    target_users VARCHAR(255), -- Comma-separated user IDs
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);


CREATE TABLE project_attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    uploaded_by INT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE project_languages (
    project_language_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    language_id INT NOT NULL,
    usage_percentage FLOAT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE,
    UNIQUE KEY unique_proj_lang (project_id, language_id)
);


CREATE TABLE project_members (
    project_member_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role_in_project VARCHAR(50),
    member_type ENUM('Owner', 'Collaborator') DEFAULT 'Collaborator',
    total_hours_worked FLOAT DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    invited_by INT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_project_user (project_id, user_id)
);

CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Canceled') DEFAULT 'Planning',
    budget DECIMAL(15, 2),
    budget_used DECIMAL(15, 2) DEFAULT 0,
    owner_id INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estimated_hours FLOAT,
    actual_hours FLOAT DEFAULT 0,
    completion_percentage FLOAT DEFAULT 0,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

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


CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(255),
    changes_made TEXT,
    status_code INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    parent_comment_id INT,
    is_edited BOOLEAN DEFAULT FALSE,
    mentions JSON,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

CREATE TABLE subtasks (
    subtask_id INT PRIMARY KEY AUTO_INCREMENT,
    parent_task_id INT NOT NULL,
    assigned_to INT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('Todo', 'InProgress', 'Done') DEFAULT 'Todo',
    estimated_hours FLOAT,
    actual_hours FLOAT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deadline DATETIME,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE task_attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    uploaded_by INT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE task_dependencies (
    task_id INT NOT NULL,
    dependent_task_id INT NOT NULL,
    dependency_type ENUM('Blocks', 'Is blocked by', 'Relates to') DEFAULT 'Blocks',
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, dependent_task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE task_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT,
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    time_in_status INT, -- Time spent in the previous status in minutes
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE task_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE tasks (
    task_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    type INT,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Backlog', 'Todo', 'InProgress', 'Review', 'Done') DEFAULT 'Backlog',
    created_by INT,
    assigned_to INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deadline DATETIME,
    estimated_hours FLOAT,
    actual_hours FLOAT DEFAULT 0,
    budget_used DECIMAL(10, 2) DEFAULT 0,
    tags VARCHAR(255),
    is_billable BOOLEAN DEFAULT TRUE,
    completion_percentage FLOAT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (type) REFERENCES task_types(type_id) ON DELETE SET NULL
);


CREATE TABLE time_entries (
    time_entry_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    time_spent FLOAT NOT NULL,
    entry_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    approved_by INT,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE project_teams (
    project_id INT NOT NULL,
    team_id INT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    PRIMARY KEY (project_id, team_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE team_members (
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    invited_by INT,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE teams (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    lead_user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);



