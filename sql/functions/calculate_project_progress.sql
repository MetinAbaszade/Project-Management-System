-- Function to calculate project progress based on task completion
DELIMITER //

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
                WHEN status = 'Backlog' THEN 0
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
    
    -- Handle NULL case (can happen if all tasks are in Backlog)
    IF weighted_progress IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND(weighted_progress, 2);
END//

DELIMITER ;

-- Procedure to update project completion percentages
DELIMITER //

CREATE PROCEDURE update_project_completion_percentages()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE curr_project_id INT;
    DECLARE project_cursor CURSOR FOR SELECT project_id FROM projects;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN project_cursor;
    
    read_loop: LOOP
        FETCH project_cursor INTO curr_project_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Update completion_percentage for each project
        UPDATE projects 
        SET completion_percentage = calculate_project_progress(curr_project_id)
        WHERE project_id = curr_project_id;
    END LOOP;
    
    CLOSE project_cursor;
END//

DELIMITER ;
