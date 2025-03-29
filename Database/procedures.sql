DELIMITER //

-- Create a new project
DROP PROCEDURE IF EXISTS sp_create_project;
CREATE PROCEDURE sp_create_project (
    IN p_Name VARCHAR(100),
    IN p_Description TEXT,
    IN p_StartDate DATE,
    IN p_EndDate DATE,
    IN p_Status ENUM('Planning','Active','On Hold','Completed','Canceled'),
    IN p_Budget DECIMAL(15,2),
    IN p_OwnerId CHAR(36),
    IN p_IsPublic BOOLEAN,
    IN p_EstimatedHours FLOAT
)
BEGIN
    INSERT INTO Projects 
      (Name, Description, StartDate, EndDate, Status, Budget, OwnerId, IsPublic, EstimatedHours)
    VALUES 
      (p_Name, p_Description, p_StartDate, p_EndDate, p_Status, p_Budget, p_OwnerId, p_IsPublic, p_EstimatedHours);
END;
//

-- Update an existing project
DROP PROCEDURE IF EXISTS sp_update_project;
CREATE PROCEDURE sp_update_project (
    IN p_ProjectId CHAR(36),
    IN p_Name VARCHAR(100),
    IN p_Description TEXT,
    IN p_Status ENUM('Planning','Active','On Hold','Completed','Canceled')
)
BEGIN
    UPDATE Projects 
    SET Name = p_Name,
        Description = p_Description,
        Status = p_Status,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE Id = p_ProjectId;
END;
//

-- Soft-delete a project (set IsDeleted to 1)
DROP PROCEDURE IF EXISTS sp_delete_project;
CREATE PROCEDURE sp_delete_project (
    IN p_ProjectId CHAR(36)
)
BEGIN
    UPDATE Projects 
    SET IsDeleted = 1,
        UpdatedAt = CURRENT_TIMESTAMP
    WHERE Id = p_ProjectId;
END;
//

-- Create a new task
DROP PROCEDURE IF EXISTS sp_create_task;
CREATE PROCEDURE sp_create_task (
    IN p_ProjectId CHAR(36),
    IN p_Title VARCHAR(100),
    IN p_Description TEXT,
    IN p_Type CHAR(36),
    IN p_Priority ENUM('Low','Medium','High','Critical'),
    IN p_Status ENUM('Backlog','Todo','InProgress','Review','Done'),
    IN p_CreatedBy CHAR(36),
    IN p_AssignedTo CHAR(36),
    IN p_Deadline DATETIME,
    IN p_EstimatedHours FLOAT,
    IN p_IsBillable BOOLEAN
)
BEGIN
    INSERT INTO Tasks (
      ProjectId, Title, Description, Type, Priority, Status, CreatedBy, AssignedTo, Deadline, EstimatedHours, IsBillable
    )
    VALUES (
      p_ProjectId, p_Title, p_Description, p_Type, p_Priority, p_Status, p_CreatedBy, p_AssignedTo, p_Deadline, p_EstimatedHours, p_IsBillable
    );
END;
//

DELIMITER ;
