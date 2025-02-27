-- Generate a productivity report for a user or team
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    
    -- Tasks
    COUNT(DISTINCT t.task_id) AS total_tasks_assigned,
    SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS tasks_completed,
    SUM(CASE WHEN t.deadline < CURRENT_DATE() AND t.status != 'Done' THEN 1 ELSE 0 END) AS tasks_overdue,
    
    -- Time tracking
    SUM(te.time_spent) AS total_hours_logged,
    COUNT(DISTINCT DATE(te.entry_date)) AS days_with_time_entries,
    ROUND(SUM(te.time_spent) / COUNT(DISTINCT DATE(te.entry_date)), 2) AS avg_hours_per_active_day,
    
    -- Projects
    COUNT(DISTINCT t.project_id) AS projects_worked_on,
    
    -- Task type breakdown
    (SELECT GROUP_CONCAT(CONCAT(tt.type_name, ': ', COUNT(t2.task_id)) SEPARATOR ', ')
     FROM tasks t2
     JOIN task_types tt ON t2.type = tt.type_id
     WHERE t2.assigned_to = u.user_id AND t2.status = 'Done'
     GROUP BY tt.type_id) AS completed_task_types,
    
    -- Efficiency
    CASE
        WHEN SUM(t.estimated_hours) > 0 THEN (SUM(te.time_spent) / SUM(t.estimated_hours) * 100)
        ELSE NULL
    END AS time_estimate_accuracy
FROM 
    users u
LEFT JOIN 
    tasks t ON u.user_id = t.assigned_to
LEFT JOIN 
    time_entries te ON u.user_id = te.user_id
WHERE 
    (? IS NULL OR u.user_id = ?) AND -- Filter by specific user
    (? IS NULL OR te.entry_date >= ?) AND -- Filter by start_date
    (? IS NULL OR te.entry_date <= ?) -- Filter by end_date
GROUP BY 
    u.user_id
ORDER BY 
    total_hours_logged DESC;