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