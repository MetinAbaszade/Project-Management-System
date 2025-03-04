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