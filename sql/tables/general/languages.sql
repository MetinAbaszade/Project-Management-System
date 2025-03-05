CREATE TABLE languages (
    language_id INT PRIMARY KEY AUTO_INCREMENT,
    language_name VARCHAR(50) NOT NULL UNIQUE,
    language_code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0
);

-- Insert default languages
INSERT INTO languages (language_name, language_code, display_order) VALUES
('JavaScript', 'js', 1),
('Python', 'py', 2),
('Java', 'java', 3),
('C#', 'cs', 4),
('PHP', 'php', 5),
('Ruby', 'rb', 6),
('TypeScript', 'ts', 7),
('Swift', 'swift', 8),
('Go', 'go', 9),
('Kotlin', 'kt', 10);