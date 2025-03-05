-- Assign a task to a user
UPDATE tasks
SET 
    assigned_to = ?,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    task_id = ?;

-- Insert an audit log entry for the assignment
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    changes_made
) VALUES (
    ?, -- user_id (who made the assignment)
    'ASSIGN_TASK',
    'TASK',
    ?, -- task_id
    CONCAT('{"old_assignee":"', (SELECT assigned_to FROM tasks WHERE task_id = ?), '", "new_assignee":"', ?, '"}')
);

-- Create a notification for the assignee
INSERT INTO notifications (
    user_id,
    title,
    content,
    notification_type,
    entity_type,
    entity_id,
    source_user_id
) VALUES (
    ?, -- user_id (assignee)
    'Task Assigned',
    CONCAT('You have been assigned the task: ', (SELECT title FROM tasks WHERE task_id = ?)),
    'TASK_ASSIGNMENT',
    'TASK',
    ?, -- task_id
    ? -- source_user_id (who made the assignment)
);
