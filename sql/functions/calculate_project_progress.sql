DELIMITER //

CREATE FUNCTION calculate_project_progress(project_id_param INT) 
RETURNS FLOAT
READS SQL DATA
BEGIN
    DECLARE total_tasks INT DEFAULT 0;
    DECLARE completed_tasks INT DEFAULT 0;
    DECLARE progress FLOAT DEFAULT 0;
    
    -- Count total tasks
    SELECT COUNT(*) INTO total_tasks
    FROM tasks
    WHERE project_id = project_id_param;
    
    -- Count completed tasks (status = 'Done')
    SELECT COUNT(*) INTO completed_tasks
    FROM tasks
    WHERE project_id = project_id_param
    AND status = 'Done';
    
    -- Calculate progress percentage
    IF total_tasks > 0 THEN
        SET progress = (completed_tasks / total_tasks) * 100;
    END IF;
    
    -- Update the project's completion_percentage
    UPDATE projects
    SET completion_percentage = progress,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_id = project_id_param;
    
    RETURN progress;
END//

DELIMITER ;