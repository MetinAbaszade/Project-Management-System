-- File: queries/projects/get_project_details.sql

-- Get basic project details
SELECT 
    p.project_id,
    p.name,
    p.description,
    p.start_date,
    p.end_date,
    p.status,
    p.budget,
    p.budget_used,
    p.is_public,
    p.created_at,
    p.updated_at,
    p.estimated_hours,
    p.actual_hours,
    p.completion_percentage,
    CONCAT(o.first_name, ' ', o.last_name) AS owner_name,
    o.user_id AS owner_id,
    o.email AS owner_email,
    o.image_url AS owner_image,
    (
        SELECT COUNT(*) 
        FROM project_members 
        WHERE project_id = p.project_id
    ) AS member_count,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id
    ) AS task_count,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id 
        AND status = 'Done'
    ) AS completed_task_count,
    (
        SELECT COALESCE(SUM(time_spent), 0)
        FROM time_entries te
        JOIN tasks t ON te.task_id = t.task_id
        WHERE t.project_id = p.project_id
    ) AS total_logged_hours
FROM 
    projects p
JOIN 
    users o ON p.owner_id = o.user_id
WHERE 
    p.project_id = :project_id;

-- Get project members
SELECT 
    pm.project_member_id,
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS member_name,
    u.email,
    u.image_url,
    pm.role_in_project,
    pm.member_type,
    pm.total_hours_worked,
    pm.hourly_rate,
    pm.joined_at
FROM 
    project_members pm
JOIN 
    users u ON pm.user_id = u.user_id
WHERE 
    pm.project_id = :project_id
ORDER BY 
    CASE 
        WHEN pm.member_type = 'Owner' THEN 0
        ELSE 1
    END,
    u.first_name, u.last_name;

-- Get project boards
SELECT 
    b.board_id,
    b.name,
    b.board_type,
    b.description,
    b.is_default,
    CONCAT(u.first_name, ' ', u.last_name) AS created_by_name,
    b.created_at,
    (
        SELECT COUNT(*) 
        FROM board_columns 
        WHERE board_id = b.board_id
    ) AS column_count,
    (
        SELECT COUNT(*) 
        FROM tasks t
        JOIN board_columns bc ON t.status = bc.task_status
        WHERE bc.board_id = b.board_id
        AND t.project_id = b.project_id
    ) AS task_count
FROM 
    boards b
LEFT JOIN 
    users u ON b.created_by = u.user_id
WHERE 
    b.project_id = :project_id
ORDER BY 
    b.is_default DESC, b.name;

-- Get project languages
SELECT 
    pl.project_language_id,
    l.language_id,
    l.language_name,
    l.language_code,
    pl.usage_percentage,
    pl.notes
FROM 
    project_languages pl
JOIN 
    languages l ON pl.language_id = l.language_id
WHERE 
    pl.project_id = :project_id
ORDER BY 
    pl.usage_percentage DESC;

-- Get project task summary by status
SELECT 
    t.status,
    COUNT(*) AS task_count,
    COUNT(CASE WHEN t.priority = 'High' OR t.priority = 'Critical' THEN 1 END) AS high_priority_count,
    SUM(t.estimated_hours) AS total_estimated_hours,
    SUM(t.actual_hours) AS total_actual_hours
FROM 
    tasks t
WHERE 
    t.project_id = :project_id
GROUP BY 
    t.status
ORDER BY 
    FIELD(t.status, 'Backlog', 'Todo', 'InProgress', 'Review', 'Done');