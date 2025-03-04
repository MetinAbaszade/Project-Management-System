-- File: queries/projects/get_user_project.sql

-- Get all projects where the user is a member
SELECT 
    p.project_id,
    p.name,
    p.description,
    p.start_date,
    p.end_date,
    p.status,
    p.completion_percentage,
    pm.role_in_project,
    pm.member_type,
    CONCAT(o.first_name, ' ', o.last_name) AS owner_name,
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
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id 
        AND assigned_to = :user_id
    ) AS assigned_task_count,
    (
        SELECT SUM(time_spent) 
        FROM time_entries te
        JOIN tasks t ON te.task_id = t.task_id
        WHERE t.project_id = p.project_id
        AND te.user_id = :user_id
    ) AS user_logged_hours
FROM 
    projects p
JOIN 
    project_members pm ON p.project_id = pm.project_id
JOIN 
    users o ON p.owner_id = o.user_id
WHERE 
    pm.user_id = :user_id
    AND (COALESCE(:status, '') = '' OR p.status = :status)
    AND (
        COALESCE(:search_term, '') = ''
        OR p.name LIKE CONCAT('%', :search_term, '%')
        OR p.description LIKE CONCAT('%', :search_term, '%')
    )
ORDER BY 
    CASE 
        WHEN :sort_field = 'name' AND :sort_direction = 'asc' THEN p.name
    END ASC,
    CASE 
        WHEN :sort_field = 'name' AND :sort_direction = 'desc' THEN p.name
    END DESC,
    CASE 
        WHEN :sort_field = 'end_date' AND :sort_direction = 'asc' THEN p.end_date
    END ASC,
    CASE 
        WHEN :sort_field = 'end_date' AND :sort_direction = 'desc' THEN p.end_date
    END DESC,
    CASE 
        WHEN :sort_field = 'status' AND :sort_direction = 'asc' THEN p.status
    END ASC,
    CASE 
        WHEN :sort_field = 'status' AND :sort_direction = 'desc' THEN p.status
    END DESC,
    CASE 
        WHEN :sort_field = 'completion' AND :sort_direction = 'asc' THEN p.completion_percentage
    END ASC,
    CASE 
        WHEN :sort_field = 'completion' AND :sort_direction = 'desc' THEN p.completion_percentage
    END DESC,
    -- Default sort by created date if not specified
    CASE 
        WHEN :sort_field IS NULL OR :sort_field = '' THEN p.created_at
    END DESC
LIMIT :limit OFFSET :offset;

-- Get recently active projects for the user
SELECT 
    p.project_id,
    p.name,
    p.status,
    pm.role_in_project,
    MAX(al.action_time) AS last_activity,
    COUNT(DISTINCT t.task_id) AS assigned_tasks,
    COUNT(DISTINCT CASE WHEN t.status != 'Done' THEN t.task_id END) AS open_tasks
FROM 
    projects p
JOIN 
    project_members pm ON p.project_id = pm.project_id
LEFT JOIN 
    tasks t ON p.project_id = t.project_id AND t.assigned_to = :user_id
LEFT JOIN (
    -- Get user actions in this project
    SELECT 
        a.action_time,
        a.entity_id,
        CASE 
            WHEN a.entity_type = 'PROJECT' THEN a.entity_id
            WHEN a.entity_type = 'TASK' THEN (SELECT project_id FROM tasks WHERE task_id = a.entity_id)
            WHEN a.entity_type = 'BOARD' THEN (SELECT project_id FROM boards WHERE board_id = a.entity_id)
            WHEN a.entity_type = 'SPRINT' THEN (SELECT project_id FROM sprints WHERE sprint_id = a.entity_id)
        END AS project_id
    FROM 
        audit_logs a
    WHERE 
        a.user_id = :user_id
        AND a.action_time >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
) al ON p.project_id = al.project_id
WHERE 
    pm.user_id = :user_id
    AND p.status = 'Active'
GROUP BY 
    p.project_id, p.name, p.status, pm.role_in_project
ORDER BY 
    last_activity DESC NULLS LAST,
    open_tasks DESC
LIMIT 5;

-- Get total count of user's projects for pagination
SELECT 
    COUNT(*) AS total_count
FROM 
    projects p
JOIN 
    project_members pm ON p.project_id = pm.project_id
WHERE 
    pm.user_id = :user_id
    AND (COALESCE(:status, '') = '' OR p.status = :status)
    AND (
        COALESCE(:search_term, '') = ''
        OR p.name LIKE CONCAT('%', :search_term, '%')
        OR p.description LIKE CONCAT('%', :search_term, '%')
    );