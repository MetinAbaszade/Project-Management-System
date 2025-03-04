-- File: queries/admin/get_system_statistics.sql

-- Get overall system statistics
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = 1) AS active_users,
    (SELECT COUNT(*) FROM users WHERE is_active = 0) AS inactive_users,
    (SELECT COUNT(*) FROM projects WHERE status = 'Active') AS active_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'Completed') AS completed_projects,
    (SELECT COUNT(*) FROM tasks WHERE status = 'Done') AS completed_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status != 'Done') AS pending_tasks,
    (SELECT COALESCE(SUM(time_spent), 0) FROM time_entries) AS total_hours_logged,
    (SELECT COALESCE(SUM(budget), 0) FROM projects) AS total_budget,
    (SELECT COALESCE(SUM(budget_used), 0) FROM projects) AS total_budget_used,
    (SELECT COUNT(*) FROM teams) AS total_teams,
    (SELECT COUNT(*) FROM sprints WHERE status = 'Active') AS active_sprints;

-- Get user registration trend (last 12 months)
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') AS month,
    COUNT(*) AS new_users
FROM 
    users
WHERE 
    created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY 
    DATE_FORMAT(created_at, '%Y-%m')
ORDER BY 
    month;

-- Get task completion trend (last 12 weeks)
SELECT 
    YEARWEEK(tsh.updated_at, 1) AS year_week,
    COUNT(*) AS completed_tasks
FROM 
    task_status_history tsh
WHERE 
    tsh.new_status = 'Done'
    AND tsh.updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 WEEK)
GROUP BY 
    YEARWEEK(tsh.updated_at, 1)
ORDER BY 
    year_week;

-- Get top active projects (by hours logged in last 30 days)
SELECT 
    p.project_id,
    p.name AS project_name,
    p.status,
    COUNT(DISTINCT t.task_id) AS total_tasks,
    SUM(te.time_spent) AS hours_logged
FROM 
    projects p
JOIN 
    tasks t ON p.project_id = t.project_id
JOIN 
    time_entries te ON t.task_id = te.task_id
WHERE 
    te.entry_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY 
    p.project_id, p.name, p.status
ORDER BY 
    hours_logged DESC
LIMIT 10;

-- Get top active users (by hours logged in last 30 days)
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    COUNT(DISTINCT te.task_id) AS tasks_worked,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT p.project_id) AS projects_involved
FROM 
    users u
JOIN 
    time_entries te ON u.user_id = te.user_id
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
WHERE 
    te.entry_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY 
    u.user_id, user_name
ORDER BY 
    hours_logged DESC
LIMIT 10;

-- Get system performance metrics
SELECT 
    DATE_FORMAT(action_time, '%Y-%m-%d') AS date,
    COUNT(*) AS total_requests,
    AVG(CASE WHEN status_code BETWEEN 200 AND 299 THEN 1 ELSE 0 END) * 100 AS success_rate_pct,
    COUNT(DISTINCT user_id) AS unique_users
FROM 
    audit_logs
WHERE 
    action_time >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY 
    DATE_FORMAT(action_time, '%Y-%m-%d')
ORDER BY 
    date;