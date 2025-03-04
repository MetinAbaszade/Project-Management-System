-- File: queries/reports/project_status_report.sql

-- Get overall project status report
SELECT 
    p.project_id,
    p.name,
    p.description,
    p.status,
    p.start_date,
    p.end_date,
    p.completion_percentage,
    DATEDIFF(p.end_date, CURRENT_DATE()) AS days_remaining,
    CASE 
        WHEN DATEDIFF(p.end_date, p.start_date) > 0 
        THEN ROUND(DATEDIFF(CURRENT_DATE(), p.start_date) / DATEDIFF(p.end_date, p.start_date) * 100, 2)
        ELSE NULL
    END AS time_elapsed_percentage,
    p.budget,
    p.budget_used,
    CASE 
        WHEN p.budget > 0 
        THEN ROUND((p.budget_used / p.budget) * 100, 2)
        ELSE NULL
    END AS budget_utilized_percentage,
    CONCAT(o.first_name, ' ', o.last_name) AS owner_name,
    o.email AS owner_email,
    (
        SELECT COUNT(*) 
        FROM project_members 
        WHERE project_id = p.project_id
    ) AS member_count,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id
    ) AS total_tasks,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id 
        AND status = 'Done'
    ) AS completed_tasks,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id 
        AND priority IN ('High', 'Critical')
        AND status != 'Done'
    ) AS high_priority_open_tasks
FROM 
    projects p
JOIN 
    users o ON p.owner_id = o.user_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND (COALESCE(:status, '') = '' OR p.status = :status)
ORDER BY 
    CASE WHEN :status IS NULL OR :status = '' THEN 
        CASE
            WHEN p.status = 'Active' THEN 1
            WHEN p.status = 'Planning' THEN 2
            WHEN p.status = 'On Hold' THEN 3
            WHEN p.status = 'Completed' THEN 4
            WHEN p.status = 'Canceled' THEN 5
        END
    END,
    CASE 
        WHEN p.status = 'Active' OR p.status = 'Planning' THEN 
            CASE 
                WHEN DATEDIFF(p.end_date, CURRENT_DATE()) < 0 THEN 0  -- Overdue first
                ELSE DATEDIFF(p.end_date, CURRENT_DATE())
            END
        ELSE p.updated_at
    END;

-- Get task status distribution by project
SELECT 
    p.project_id,
    p.name AS project_name,
    t.status,
    COUNT(*) AS task_count,
    ROUND(
        (COUNT(*) / (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE project_id = p.project_id
        )) * 100,
        2
    ) AS percentage
FROM 
    projects p
JOIN 
    tasks t ON p.project_id = t.project_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND (COALESCE(:status, '') = '' OR p.status = :status)
GROUP BY 
    p.project_id, p.name, t.status
ORDER BY 
    project_name, 
    FIELD(t.status, 'Backlog', 'Todo', 'InProgress', 'Review', 'Done');

-- Get task completion trend over time
SELECT 
    DATE_FORMAT(tsh.updated_at, '%Y-%m-%d') AS date,
    p.project_id,
    p.name AS project_name,
    COUNT(*) AS tasks_completed
FROM 
    task_status_history tsh
JOIN 
    tasks t ON tsh.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
WHERE 
    tsh.new_status = 'Done'
    AND (