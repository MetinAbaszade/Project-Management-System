-- Procedure to automatically assign tasks to a sprint based on priority and other criteria
CREATE PROCEDURE assign_tasks_to_sprint(
    IN sprint_id_param INT,
    IN max_story_points FLOAT,
    IN assignee_id INT,
    IN added_by_user_id INT
)
BEGIN
    DECLARE total_points FLOAT DEFAULT 0;
    DECLARE task_id_var INT;
    DECLARE task_points FLOAT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE task_cursor CURSOR FOR
        SELECT t.task_id, 
               CASE
                   WHEN t.estimated_hours IS NULL THEN 1
                   WHEN t.estimated_hours <= 2 THEN 1
                   WHEN t.estimated_hours <= 4 THEN 2
                   WHEN t.estimated_hours <= 8 THEN 3
                   WHEN t.estimated_hours <= 16 THEN 5
                   WHEN t.estimated_hours <= 24 THEN 8
                   ELSE 13
               END AS story_points
        FROM tasks t
        LEFT JOIN sprint_tasks st ON t.task_id = st.task_id
        WHERE t.project_id = (SELECT project_id FROM sprints WHERE sprint_id = sprint_id_param)
          AND t.status IN ('Backlog', 'Todo')
          AND st.sprint_id IS NULL
          AND (assignee_id IS NULL OR t.assigned_to = assignee_id)
        ORDER BY 
            CASE t.priority
                WHEN 'Critical' THEN 1
                WHEN 'High' THEN 2
                WHEN 'Medium' THEN 3
                WHEN 'Low' THEN 4
            END,
            t.deadline IS NULL, t.deadline,
            t.created_at;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN task_cursor;
    
    read_loop: LOOP
        FETCH task_cursor INTO task_id_var, task_points;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Check if adding this task would exceed max points
        IF (total_points + task_points) <= max_story_points THEN
            -- Add task to sprint
            INSERT INTO sprint_tasks (sprint_id, task_id, added_by, added_at, story_points)
            VALUES (sprint_id_param, task_id_var, added_by_user_id, NOW(), task_points);
            
            -- Update total points
            SET total_points = total_points + task_points;
            
            -- Log the action
            INSERT INTO audit_logs (
                user_id, 
                action_type, 
                entity_type, 
                entity_id, 
                changes_made
            ) VALUES (
                added_by_user_id,
                'ADD_TO_SPRINT',
                'TASK',
                task_id_var,
                CONCAT('{"sprint_id":', sprint_id_param, ', "story_points":', task_points, '}')
            );
        ELSE
            -- We've reached capacity, stop adding tasks
            LEAVE read_loop;
        END IF;
    END LOOP;
    
    CLOSE task_cursor;
    
    -- Update sprint capacity
    UPDATE sprints
    SET capacity = total_points
    WHERE sprint_id = sprint_id_param;
    
END;