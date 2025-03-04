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
