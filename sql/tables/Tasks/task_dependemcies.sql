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