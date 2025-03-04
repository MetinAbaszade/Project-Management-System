DELIMITER //

CREATE PROCEDURE assign_tasks_to_sprints(
    IN sprint_id_param INT,
    IN task_ids TEXT,
    IN user_id_param INT,
    OUT assigned_count INT
)
BEGIN
    DECLARE task_id_value INT;
    DECLARE separator CHAR(1) DEFAULT ',';
    DECLARE done INT DEFAULT 0;
    DECLARE pos INT DEFAULT 1;
    DECLARE next_pos INT DEFAULT 0;
    DECLARE task_list TEXT;
    
    -- Initialize counter
    SET assigned_count = 0;
    SET task_list = task_ids;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Parse the comma-separated task IDs and insert them
    task_parsing: LOOP
        -- Find the position of the next separator
        SET next_pos = LOCATE(separator, task_list, pos);
        
        -- If no more separators, get the rest of the string
        IF next_pos = 0 THEN
            SET next_pos = LENGTH(task_list) + 1;
            SET done = 1;
        END IF;
        
        -- Extract the task ID
        SET task_id_value = CAST(SUBSTRING(task_list, pos, next_pos - pos) AS UNSIGNED);
        
        -- Skip if task_id is invalid
        IF task_id_value > 0 THEN
            -- Check if task exists and is not already in a sprint
            IF EXISTS (
                SELECT 1 FROM tasks 
                WHERE task_id = task_id_value
                AND NOT EXISTS (
                    SELECT 1 FROM sprint_tasks 
                    WHERE task_id = task_id_value
                )
            ) THEN
                -- Insert into sprint_tasks
                INSERT INTO sprint_tasks (sprint_id, task_id, added_by, added_at)
                VALUES (sprint_id_param, task_id_value, user_id_param, NOW())
                ON DUPLICATE KEY UPDATE 
                    added_by = user_id_param,
                    added_at = NOW();
                
                -- Increment counter if inserted successfully
                IF ROW_COUNT() > 0 THEN
                    SET assigned_count = assigned_count + 1;
                END IF;
            END IF;
        END IF;
        
        -- If done, exit the loop
        IF done THEN
            LEAVE task_parsing;
        END IF;
        
        -- Move position for next iteration
        SET pos = next_pos + 1;
    END LOOP task_parsing;
    
    -- If we assigned tasks, update sprint status to reflect this
    IF assigned_count > 0 THEN
        -- Update sprint status if it's in planning
        UPDATE sprints 
        SET status = CASE 
                WHEN status = 'Planning' THEN 'Active'
                ELSE status
            END
        WHERE sprint_id = sprint_id_param;
        
        -- Log the action
        INSERT INTO audit_logs (
            user_id, action_type, entity_type, entity_id,
            action_time, changes_made
        )
        VALUES (
            user_id_param, 'ASSIGN', 'SPRINT_TASKS', sprint_id_param,
            NOW(), CONCAT('Assigned ', assigned_count, ' tasks to sprint')
        );
    END IF;
    
    COMMIT;
END//

DELIMITER ;