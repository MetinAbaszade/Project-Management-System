-- Initial database schema creation

-- Auth Tables
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- Project Tables
CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Canceled') DEFAULT 'Planning',
    budget DECIMAL(15, 2),
    budget_used DECIMAL(15, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    project_member_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role_in_project VARCHAR(50),
    total_hours_worked FLOAT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_user (project_id, user_id)
);

CREATE TABLE project_attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Language Tables
CREATE TABLE languages (
    language_id INT PRIMARY KEY AUTO_INCREMENT,
    language_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE project_languages (
    project_language_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    language_id INT NOT NULL,
    usage_percentage FLOAT DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE,
    UNIQUE KEY unique_proj_lang (project_id, language_id)
);

-- Task Tables
CREATE TABLE task_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
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
    budget_used DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (type) REFERENCES task_types(type_id) ON DELETE SET NULL
);

CREATE TABLE task_dependencies (
    task_id INT NOT NULL,
    dependent_task_id INT NOT NULL,
    PRIMARY KEY (task_id, dependent_task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

CREATE TABLE task_attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(100) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

CREATE TABLE task_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT,
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE subtasks (
    subtask_id INT PRIMARY KEY AUTO_INCREMENT,
    parent_task_id INT NOT NULL,
    assigned_to INT,
    title VARCHAR(100) NOT NULL,
    status ENUM('Todo', 'InProgress', 'Done') DEFAULT 'Todo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Agile Tables
CREATE TABLE sprints (
    sprint_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    goal TEXT,
    status ENUM('Planning', 'Active', 'Completed', 'Canceled') DEFAULT 'Planning',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE TABLE sprint_tasks (
    sprint_id INT NOT NULL,
    task_id INT NOT NULL,
    PRIMARY KEY (sprint_id, task_id),
    FOREIGN KEY (sprint_id) REFERENCES sprints(sprint_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

CREATE TABLE boards (
    board_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    board_type ENUM('Kanban', 'Scrum', 'Custom') DEFAULT 'Kanban',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE TABLE board_columns (
    column_id INT PRIMARY KEY AUTO_INCREMENT,
    board_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    order_index INT NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE
);

-- Collaboration Tables
CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE time_entries (
    time_entry_id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    time_spent FLOAT NOT NULL,
    entry_date DATE NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Notification System
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);