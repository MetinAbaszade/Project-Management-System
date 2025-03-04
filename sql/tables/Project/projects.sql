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
