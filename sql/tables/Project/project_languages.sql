CREATE TABLE project_languages (
    project_language_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    language_id INT NOT NULL,
    usage_percentage FLOAT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE,
    UNIQUE KEY unique_proj_lang (project_id, language_id)
);
