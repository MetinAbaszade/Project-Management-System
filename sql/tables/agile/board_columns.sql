CREATE TABLE board_columns (
    column_id INT PRIMARY KEY AUTO_INCREMENT,
    board_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    order_index INT NOT NULL,
    wip_limit INT,
    task_status VARCHAR(20),
    description TEXT,
    color VARCHAR(7),
    FOREIGN KEY (board_id) REFERENCES boards(board_id) ON DELETE CASCADE
);