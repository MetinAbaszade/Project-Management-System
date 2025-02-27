-- Function to calculate project progress based on task completion
CREATE FUNCTION calculate_project_progress(project_id_param INT)
RETURNS FLOAT
DETERMINISTIC
BEGIN
    DECLARE total_tasks INT;
    DECLARE completed_tasks INT;
    DECLARE weighted_progress FLOAT;
    
    -- Get count of all tasks
    SELECT COUNT(*) INTO total_tasks
    FROM tasks
    WHERE project_id = project_id_param;
    
    -- Return 0 if no tasks exist
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    -- Calculate weighted progress based on task priority and status
    SELECT 
        SUM(
            CASE 
                WHEN status = 'Done' THEN 
                    CASE 
                        WHEN priority = 'Critical' THEN 1.5
                        WHEN priority = 'High' THEN 1.2
                        WHEN priority = 'Medium' THEN 1.0
                        WHEN priority = 'Low' THEN 0.8
                        ELSE 1.0
                    END
                WHEN status = 'Review' THEN 
                    CASE 
                        WHEN priority = 'Critical' THEN 0.8
                        WHEN priority = 'High' THEN 0.7
                        WHEN priority = 'Medium' THEN 0.6
                        WHEN priority = 'Low' THEN 0.5
                        ELSE 0.6
                    END
                WHEN status = 'InProgress' THEN 
                    CASE 
                        WHEN priority = 'Critical' THEN 0.5
                        WHEN priority = 'High' THEN 0.4
                        WHEN priority = 'Medium' THEN 0.3
                        WHEN priority = 'Low' THEN 0.2
                        ELSE 0.3
                    END
                WHEN status = 'Todo' THEN 0.1
                ELSE 0
            END
        ) / 
        SUM(
            CASE 
                WHEN priority = 'Critical' THEN 1.5
                WHEN priority = 'High' THEN 1.2
                WHEN priority = 'Medium' THEN 1.0
                WHEN priority = 'Low' THEN 0.8
                ELSE 1.0
            END
        ) * 100 INTO weighted_progress
    FROM tasks
    WHERE project_id = project_id_param;
    
    RETURN ROUND(weighted_progress, 2);
END;