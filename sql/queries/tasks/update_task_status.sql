-- Update the status of a task
BEGIN;

-- Store the old status for history tracking
SET @old_status = (SELECT status FROM tasks WHERE task_id = ?);

-- Update the task status
UPDATE tasks
SET 
    status = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    task_id = ?;

-- Insert into task_status_history
INSERT INTO task_status_history (
    task_id,
    user_id,
    old_status,
    new_status,
    time_in_status
) VALUES (
    ?, -- task_id
    ?, -- user_id
    @old_status,
    ?, -- new_status
    TIMESTAMPDIFF(MINUTE, 
        (SELECT MAX(updated_at) FROM task_status_history WHERE task_id = ? AND new_status = @old_status),
        CURRENT_TIMESTAMP
    )
);

-- If status is changed to "Done", update actual_hours and completion_percentage
IF ? = 'Done' THEN
    UPDATE tasks
    SET 
        actual_hours = (SELECT COALESCE(SUM(time_spent), 0) FROM time_entries WHERE task_id = ?),
        completion_percentage = 100
    WHERE 
        task_id = ?;
END IF;

COMMIT;