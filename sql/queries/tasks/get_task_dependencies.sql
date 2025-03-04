-- File: queries/tasks/get_task_dependencies.sql

-- Get tasks that block the given task
SELECT 
    td.task_id AS blocking_task_id,
    t.title AS blocking_task_title,
    t.status AS blocking_task_status,
    t.priority AS blocking_task_priority,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
    td.dependency_type,
    CONCAT(c.first_name, ' ', c.last_name) AS created_by_name,
    td.created_at
FROM 
    task_dependencies td
JOIN 
    tasks t ON td.task_id = t.task_id
LEFT JOIN 
    users u ON t.assigned_to = u.user_id
LEFT JOIN 
    users c ON td.created_by = c.user_id
WHERE 
    td.dependent_task_id = :task_id
ORDER BY 
    CASE 
        WHEN t.status = 'Done' THEN 1 
        WHEN t.status = 'Review' THEN 2
        WHEN t.status = 'InProgress' THEN 3
        WHEN t.status = 'Todo' THEN 4
        WHEN t.status = 'Backlog' THEN 5
    END,
    CASE 
        WHEN t.priority = 'Critical' THEN 1
        WHEN t.priority = 'High' THEN 2
        WHEN t.priority = 'Medium' THEN 3
        WHEN t.priority = 'Low' THEN 4
    END;

-- Get tasks that are blocked by the given task
SELECT 
    td.dependent_task_id AS blocked_task_id,
    t.title AS blocked_task_title,
    t.status AS blocked_task_status,
    t.priority AS blocked_task_priority,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
    td.dependency_type,
    CONCAT(c.first_name, ' ', c.last_name) AS created_by_name,
    td.created_at
FROM 
    task_dependencies td
JOIN 
    tasks t ON td.dependent_task_id = t.task_id
LEFT JOIN 
    users u ON t.assigned_to = u.user_id
LEFT JOIN 
    users c ON td.created_by = c.user_id
WHERE 
    td.task_id = :task_id
ORDER BY 
    CASE 
        WHEN t.status = 'Backlog' THEN 1
        WHEN t.status = 'Todo' THEN 2
        WHEN t.status = 'InProgress' THEN 3
        WHEN t.status = 'Review' THEN 4
        WHEN t.status = 'Done' THEN 5
    END,
    CASE 
        WHEN t.priority = 'Critical' THEN 1
        WHEN t.priority = 'High' THEN 2
        WHEN t.priority = 'Medium' THEN 3
        WHEN t.priority = 'Low' THEN 4
    END;

-- Add dependency between tasks
INSERT INTO task_dependencies (
    task_id,
    dependent_task_id,
    dependency_type,
    created_by,
    created_at
)
VALUES (
    :blocking_task_id,  -- Task that blocks
    :blocked_task_id,   -- Task that is blocked
    :dependency_type,
    :created_by,
    NOW()
);

-- Remove dependency between tasks
DELETE FROM task_dependencies
WHERE task_id = :blocking_task_id
AND dependent_task_id = :blocked_task_id;

-- Get available tasks that could be added as dependencies (not already dependencies)
SELECT 
    t.task_id,
    t.title,
    t.status,
    t.priority,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name,
    tt.type_name
FROM 
    tasks t
LEFT JOIN 
    users u ON t.assigned_to = u.user_id
LEFT JOIN 
    task_types tt ON t.type = tt.type_id
WHERE 
    t.project_id = (SELECT project_id FROM tasks WHERE task_id = :task_id)
    AND t.task_id != :task_id
    AND t.task_id NOT IN (
        -- Not already a dependency
        SELECT task_id 
        FROM task_dependencies 
        WHERE dependent_task_id = :task_id
    )
    AND t.task_id NOT IN (
        -- Not already dependent on this task
        SELECT dependent_task_id 
        FROM task_dependencies 
        WHERE task_id = :task_id
    )
ORDER BY 
    t.status, t.title;

-- Check for dependency cycles
WITH RECURSIVE dependency_path (task_id, dependent_task_id, path, cycle) AS (
    -- Start with the direct dependency we want to add
    SELECT 
        td.task_id,
        td.dependent_task_id,
        CAST(CONCAT(td.task_id, ',', td.dependent_task_id) AS CHAR(1000)),
        td.task_id = :blocked_task_id AND td.dependent_task_id = :blocking_task_id
    FROM 
        task_dependencies td
    UNION ALL
    -- Follow the dependency chain
    SELECT 
        td.task_id,
        td.dependent_task_id,
        CONCAT(dp.path, ',', td.dependent_task_id),
        dp.path LIKE CONCAT('%,', td.dependent_task_id, ',%') OR
        (td.task_id = :blocked_task_id AND td.dependent_task_id = :blocking_task_id)
    FROM 
        task_dependencies td
    JOIN 
        dependency_path dp ON td.task_id = dp.dependent_task_id
    WHERE 
        NOT dp.cycle
)
SELECT 
    EXISTS (
        SELECT 1 FROM dependency_path WHERE cycle
    ) AS would_create_cycle;