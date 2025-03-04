-- File: queries/tasks/assign_task.sql

-- Assign a task to a user
UPDATE tasks
SET 
    assigned_to = :user_id,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    task_id = :task_id;

-- Unassign a task
UPDATE tasks
SET 
    assigned_to = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    task_id = :task_id;

-- Get users eligible for task assignment (project members)
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    u.image_url,
    pm.role_in_project,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE assigned_to = u.user_id
        AND status != 'Done'
    ) AS current_assigned_tasks,
    (
        SELECT MAX(te.entry_date) 
        FROM time_entries te
        WHERE te.user_id = u.user_id
    ) AS last_activity
FROM 
    users u
JOIN 
    project_members pm ON u.user_id = pm.user_id
JOIN 
    tasks t ON pm.project_id = t.project_id
WHERE 
    t.task_id = :task_id
    AND u.is_active = TRUE
ORDER BY 
    current_assigned_tasks, last_activity DESC;

-- Get task assignment history
SELECT 
    al.action_time,
    CASE 
        WHEN JSON_VALID(al.changes_made) THEN
            JSON_UNQUOTE(JSON_EXTRACT(al.changes_made, '$.old_assigned_to'))
        ELSE NULL
    END AS previous_assignee_id,
    CASE 
        WHEN JSON_VALID(al.changes_made) THEN
            JSON_UNQUOTE(JSON_EXTRACT(al.changes_made, '$.new_assigned_to'))
        ELSE NULL
    END AS new_assignee_id,
    (
        SELECT CONCAT(first_name, ' ', last_name)
        FROM users
        WHERE user_id = CASE 
            WHEN JSON_VALID(al.changes_made) THEN
                JSON_UNQUOTE(JSON_EXTRACT(al.changes_made, '$.old_assigned_to'))
            ELSE NULL
        END
    ) AS previous_assignee_name,
    (
        SELECT CONCAT(first_name, ' ', last_name)
        FROM users
        WHERE user_id = CASE 
            WHEN JSON_VALID(al.changes_made) THEN
                JSON_UNQUOTE(JSON_EXTRACT(al.changes_made, '$.new_assigned_to'))
            ELSE NULL
        END
    ) AS new_assignee_name,
    CONCAT(u.first_name, ' ', u.last_name) AS changed_by
FROM 
    audit_logs al
JOIN 
    users u ON al.user_id = u.user_id
WHERE 
    al.entity_type = 'TASK'
    AND al.entity_id = :task_id
    AND al.action_type = 'UPDATE'
    AND (
        (JSON_VALID(al.changes_made) AND JSON_CONTAINS_PATH(al.changes_made, 'one', '$.old_assigned_to'))
        OR (JSON_VALID(al.changes_made) AND JSON_CONTAINS_PATH(al.changes_made, 'one', '$.new_assigned_to'))
    )
ORDER BY 
    al.action_time DESC;

-- Assign multiple tasks to a user
UPDATE tasks
SET 
    assigned_to = :user_id,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    task_id IN (:task_ids);

-- Log task assignment
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
    :assigner_id,
    'UPDATE',
    'TASK',
    :task_id,
    NOW(),
    :ip_address,
    JSON_OBJECT(
        'field', 'assigned_to',
        'old_assigned_to', (SELECT assigned_to FROM tasks WHERE task_id = :task_id),
        'new_assigned_to', :user_id
    )
);

-- Create notification for task assignment
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
VALUES (
    :user_id,
    'Task Assigned',
    CONCAT(
        'You have been assigned to task: ',
        (SELECT title FROM tasks WHERE task_id = :task_id)
    ),
    'TASK_ASSIGNMENT',
    'TASK',
    :task_id,
    NOW(),
    CONCAT('/tasks/', :task_id),
    :assigner_id
);