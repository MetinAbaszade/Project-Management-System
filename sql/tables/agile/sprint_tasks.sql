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