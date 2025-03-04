CREATE TABLE team_members (
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    invited_by INT,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE SET NULL
);

