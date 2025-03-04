-- File: queries/tasks/update_tasks_status.sql

-- Update task status
BEGIN;
    -- Get current status and last updated time
    SELECT 
        status, 
        updated_at
    INTO @old_status, @last_update_time
    FROM tasks 
    WHERE task_id = :task_id;
    
    -- Calculate time spent in the previous status (in minutes)
    SET @minutes_in_status = TIMESTAMPDIFF(MINUTE, @last_update_time, NOW());
    
    -- Update the task status
    UPDATE tasks
    SET 
        status = :new_status,
        updated_at = CURRENT_TIMESTAMP,
        completion_percentage = CASE 
            WHEN :new_status = 'Done' THEN 100
            WHEN :new_status = 'Review' THEN 90
            WHEN :new_status = 'InProgress' THEN 50
            WHEN :new_status = 'Todo' THEN 10
            WHEN :new_status = 'Backlog' THEN 0
            ELSE completion_percentage
        END
    WHERE 
        task_id = :task_id;
    
    -- Record status change in history
    INSERT INTO task_status_history (
        task_id,
        user_id,
        old_status,
        new_status,
        updated_at,
        notes,
        time_in_status
    )
    VALUES (
        :task_id,
        :user_id,
        @old_status,
        :new_status,
        CURRENT_TIMESTAMP,
        :notes,
        @minutes_in_status
    );
    
    -- If task is being completed, update actual_hours if not already set
    IF :new_status = 'Done' AND @old_status != 'Done' THEN
        UPDATE tasks t
        SET 
            actual_hours = COALESCE(
                t.actual_hours,
                (SELECT COALESCE(SUM(time_spent), 0) FROM time_entries WHERE task_id = :task_id)
            ),
            completion_percentage = 100
        WHERE 
            task_id = :task_id;
    END IF;
    
    -- If task is moved back from Done, reset completion percentage to appropriate value
    IF @old_status = 'Done' AND :new_status != 'Done' THEN
        UPDATE tasks
        SET 
            completion_percentage = CASE 
                WHEN :new_status = 'Review' THEN 90
                WHEN :new_status = 'InProgress' THEN 50
                WHEN :new_status = 'Todo' THEN 10
                WHEN :new_status = 'Backlog' THEN 0
            END
        WHERE 
            task_id = :task_id;
    END IF;
    
    -- Create notification for assigned user if task was assigned
    IF :new_status = 'InProgress' AND :user_id != (SELECT assigned_to FROM tasks WHERE task_id = :task_id) THEN
        INSERT INTO notifications (
            user_id,
            title,
            content,
            notification_type,
            entity_type,
            entity_id,
            created_at,
            link,
            source_user_id
        )
        SELECT
            assigned_to,
            'Task Status Updated',
            CONCAT('Task "', title, '" has been moved to In Progress'),
            'TASK_STATUS',
            'TASK',
            :task_id,
            NOW(),
            CONCAT('/tasks/', :task_id),
            :user_id
        FROM
            tasks
        WHERE
            task_id = :task_id
            AND assigned_to IS NOT NULL;
    END IF;
    
    -- Create notification for task creator when task is completed
    IF :new_status = 'Done' AND @old_status != 'Done' THEN
        INSERT INTO notifications (
            user_id,
            title,
            content,
            notification_type,
            entity_type,
            entity_id,
            created_at,
            link,
            source_user_id
        )
        SELECT
            created_by,
            'Task Completed',
            CONCAT('Task "', title, '" has been completed'),
            'TASK_STATUS',
            'TASK',
            :task_id,
            NOW(),
            CONCAT('/tasks/', :task_id),
            :user_id
        FROM
            tasks
        WHERE
            task_id = :task_id
            AND created_by IS NOT NULL
            AND created_by != :user_id;
    END IF;
    
    -- Log the status change
    INSERT INTO audit_logs (
        user_id,
        action_type,
        entity_type,
        entity_id,
        action_time,
        ip_address,
        changes_made
    )
    VALUES (
        :user_id,
        'UPDATE',
        'TASK_STATUS',
        :task_id,
        NOW(),
        :ip_address,
        CONCAT(
            'Changed task status from "', 
            @old_status, 
            '" to "', 
            :new_status,
            '"'
        )
    );
COMMIT;

-- Update multiple task statuses
BEGIN;
    -- For each task in the list
    SET @task_ids = :task_ids; -- Comma-separated list of task IDs
    SET @pos = 1;
    SET @len = LENGTH(@task_ids);
    
    WHILE @pos <= @len DO
        SET @next_comma = LOCATE(',', @task_ids, @pos);
        IF @next_comma = 0 THEN
            SET @next_comma = @len + 1;
        END IF;
        
        SET @current_task_id = CAST(SUBSTRING(@task_ids, @pos, @next_comma - @pos) AS UNSIGNED);
        
        -- Get current status
        SELECT status INTO @old_status FROM tasks WHERE task_id = @current_task_id;
        
        -- Update the task status
        UPDATE tasks
        SET 
            status = :new_status,
            updated_at = CURRENT_TIMESTAMP,
            completion_percentage = CASE 
                WHEN :new_status = 'Done' THEN 100
                WHEN :new_status = 'Review' THEN 90
                WHEN :new_status = 'InProgress' THEN 50
                WHEN :new_status = 'Todo' THEN 10
                WHEN :new_status = 'Backlog' THEN 0
                ELSE completion_percentage
            END
        WHERE 
            task_id = @current_task_id;
        
        -- Record status change in history
        INSERT INTO task_status_history (
            task_id,
            user_id,
            old_status,
            new_status,
            updated_at,
            notes
        )
        VALUES (
            @current_task_id,
            :user_id,
            @old_status,
            :new_status,
            CURRENT_TIMESTAMP,
            :notes
        );
        
        SET @pos = @next_comma + 1;
    END WHILE;
    
    -- Log the bulk status change
    INSERT INTO audit_logs (
        user_id,
        action_type,
        entity_type,
        action_time,
        ip_address,
        changes_made
    )
    VALUES (
        :user_id,
        'BULK_UPDATE',
        'TASK_STATUS',
        NOW(),
        :ip_address,
        CONCAT(
            'Changed status of multiple tasks to "', 
            :new_status,
            '". Task IDs: ',
            :task_ids
        )
    );
COMMIT;