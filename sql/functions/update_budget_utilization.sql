DELIMITER //

CREATE FUNCTION update_budget_utilization(project_id_param INT) 
RETURNS DECIMAL(15, 2)
READS SQL DATA
BEGIN
    DECLARE total_used DECIMAL(15, 2) DEFAULT 0;
    DECLARE project_budget DECIMAL(15, 2);
    
    -- Get total budget used from tasks
    SELECT COALESCE(SUM(budget_used), 0) INTO total_used
    FROM tasks
    WHERE project_id = project_id_param;
    
    -- Get project budget
    SELECT budget INTO project_budget
    FROM projects
    WHERE project_id = project_id_param;
    
    -- Update the project's budget_used field
    UPDATE projects
    SET budget_used = total_used,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_id = project_id_param;
    
    -- Return the percentage of budget utilized
    IF project_budget > 0 THEN
        RETURN (total_used / project_budget) * 100;
    ELSE
        RETURN 0;
    END IF;
END//

DELIMITER ;