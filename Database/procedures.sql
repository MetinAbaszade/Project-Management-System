DELIMITER //

-- Create a new project
CREATE PROCEDURE sp_create_project (
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_status ENUM('Planning','Active','On Hold','Completed','Canceled'),
    IN p_budget DECIMAL(15,2),
    IN p_owner_id INT,
    IN p_is_public BOOLEAN,
    IN p_estimated_hours FLOAT
)
BEGIN
    INSERT INTO projects 
      (name, description, start_date, end_date, status, budget, owner_id, is_public, estimated_hours)
    VALUES 
      (p_name, p_description, p_start_date, p_end_date, p_status, p_budget, p_owner_id, p_is_public, p_estimated_hours);
END;
//

-- Update an existing project
CREATE PROCEDURE sp_update_project (
    IN p_project_id INT,
    IN p_name VARCHAR(100),
    IN p_description TEXT,
    IN p_status ENUM('Planning','Active','On Hold','Completed','Canceled')
)
BEGIN
    UPDATE projects 
    SET name = p_name,
        description = p_description,
        status = p_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_id = p_project_id;
END;
//

-- Delete a project
CREATE PROCEDURE sp_delete_project (
    IN p_project_id INT
)
BEGIN
    DELETE FROM projects WHERE project_id = p_project_id;
END;
//

-- Create a new task
CREATE PROCEDURE sp_create_task (
    IN p_project_id INT,
    IN p_title VARCHAR(100),
    IN p_description TEXT,
    IN p_type INT,
    IN p_priority ENUM('Low','Medium','High','Critical'),
    IN p_status ENUM('Backlog','Todo','InProgress','Review','Done'),
    IN p_created_by INT,
    IN p_assigned_to INT,
    IN p_deadline DATETIME,
    IN p_estimated_hours FLOAT,
    IN p_is_billable BOOLEAN
)
BEGIN
    INSERT INTO tasks (
      project_id, title, description, type, priority, status, created_by, assigned_to, deadline, estimated_hours, is_billable
    )
    VALUES (
      p_project_id, p_title, p_description, p_type, p_priority, p_status, p_created_by, p_assigned_to, p_deadline, p_estimated_hours, p_is_billable
    );
END;
//

DELIMITER ;
