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