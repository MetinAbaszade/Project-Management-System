-- Generate a comprehensive status report for a project
SELECT 
    p.project_id,
    p.name AS project_name,
    p.description,
    p.status,
    p.start_date,
    p.end_date,
    DATEDIFF(p.end_date, CURRENT_DATE()) AS days_remaining,
    p.completion_percentage,
    p.budget,
    p.budget_used,
    (p.budget_used / p.budget * 100) AS budget_utilization_percentage,
    CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
    
    -- Progress breakdown
    COUNT(t.task_id) AS total_tasks,
    SUM(CASE WHEN t.status = 'Backlog' THEN 1 ELSE 0 END) AS backlog_tasks,
    SUM(CASE WHEN t.status = 'Todo' THEN 1 ELSE 0 END) AS todo_tasks,
    SUM(CASE WHEN t.status = 'InProgress' THEN 1 ELSE 0 END) AS in_progress_tasks,
    SUM(CASE WHEN t.status = 'Review' THEN 1 ELSE 0 END) AS review_tasks,
    SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks,
    
    -- Sprint status
    (SELECT 
        GROUP_CONCAT(CONCAT(s.name, ' (', s.status, ')') SEPARATOR ', ')
     FROM 
        sprints s
     WHERE 
        s.project_id = p.project_id
     ORDER BY 
        s.start_date DESC
     LIMIT 3) AS recent_sprints,
    
    -- Team overview
    (SELECT 
        COUNT(*)
     FROM 
        project_members pm
     WHERE 
        pm.project_id = p.project_id) AS team_size,
    
    -- Activity metrics
    (SELECT 
        COUNT(*) 
     FROM 
        task_status_history tsh
     JOIN 
        tasks t2 ON tsh.task_id = t2.task_id
     WHERE 
        t2.project_id = p.project_id AND
        tsh.updated_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) AS status_changes_last_7_days,
    
    -- Risk assessment
    CASE
        WHEN p.end_date < CURRENT_DATE() AND p.status != 'Completed' THEN 'High'
        WHEN (p.budget_used / p.budget) > 0.9 AND p.completion_percentage < 90 THEN 'High'
        WHEN (p.budget_used / p.budget) > (p.completion_percentage / 100) THEN 'Medium'
        ELSE 'Low'
    END AS risk_level
FROM 
    projects p
LEFT JOIN 
    users u ON p.owner_id = u.user_id
LEFT JOIN 
    tasks t ON p.project_id = t.project_id
WHERE 
    p.project_id = ?
GROUP BY 
    p.project_id;