-- Get comprehensive statistics for a project
SELECT
    p.project_id,
    p.name AS project_name,
    p.status,
    p.budget,
    p.budget_used,
    p.start_date,
    p.end_date,
    DATEDIFF(p.end_date, CURRENT_DATE()) AS days_remaining,
    
    -- Task Statistics
    COUNT(t.task_id) AS total_tasks,
    SUM(CASE WHEN t.status = 'Backlog' THEN 1 ELSE 0 END) AS backlog_tasks,
    SUM(CASE WHEN t.status = 'Todo' THEN 1 ELSE 0 END) AS todo_tasks,
    SUM(CASE WHEN t.status = 'InProgress' THEN 1 ELSE 0 END) AS in_progress_tasks,
    SUM(CASE WHEN t.status = 'Review' THEN 1 ELSE 0 END) AS review_tasks,
    SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks,
    
    -- Time Statistics
    SUM(te.time_spent) AS total_hours_logged,
    p.estimated_hours,
    (SUM(te.time_spent) / p.estimated_hours * 100) AS time_utilization_percentage,
    
    -- Budget Statistics
    (p.budget_used / p.budget * 100) AS budget_utilization_percentage,
    
    -- Team Statistics
    COUNT(DISTINCT pm.user_id) AS team_size,
    
    -- Current Sprint
    (SELECT s.name FROM sprints s WHERE s.project_id = p.project_id AND s.status = 'Active' LIMIT 1) AS active_sprint,
    
    -- Velocity
    (SELECT AVG(s.velocity) FROM sprints s WHERE s.project_id = p.project_id AND s.status = 'Completed') AS avg_velocity
FROM
    projects p
LEFT JOIN
    tasks t ON p.project_id = t.project_id
LEFT JOIN
    time_entries te ON t.task_id = te.task_id
LEFT JOIN
    project_members pm ON p.project_id = pm.project_id
WHERE
    p.project_id = ?
GROUP BY
    p.project_id;