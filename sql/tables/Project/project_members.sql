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