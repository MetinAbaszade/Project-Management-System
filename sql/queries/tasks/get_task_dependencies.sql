-- Get all dependencies for a task (both directions)
-- Tasks that are blocked by this task
SELECT 
    t.*,
    'blocking' AS dependency_direction,
    td.dependency_type,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
    p.name AS project_name
FROM 
    task_dependencies td
JOIN 
    tasks t ON td.dependent_task_id = t.task_id
LEFT JOIN 
    users u ON t.assigned_to = u.user_id
LEFT JOIN 
    projects p ON t.project_id = p.project_id
WHERE 
    td.task_id = ?

UNION ALL

-- Tasks that this task is blocked by
SELECT 
    t.*,
    'blocked_by' AS dependency_direction,
    td.dependency_type,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
    p.name AS project_name
FROM 
    task_dependencies td
JOIN 
    tasks t ON td.task_id = t.task_id
LEFT JOIN 
    users u ON t.assigned_to = u.user_id
LEFT JOIN 
    projects p ON t.project_id = p.project_id
WHERE 
    td.dependent_task_id = ?;