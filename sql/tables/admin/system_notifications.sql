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