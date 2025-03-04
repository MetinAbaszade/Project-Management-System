-- File: queries/projects/get_project_statistics.sql

-- Get overall project statistics
SELECT 
    p.project_id,
    p.name,
    p.status,
    p.completion_percentage,
    p.start_date,
    p.end_date,
    p.budget,
    p.budget_used,
    CASE
        WHEN p.budget > 0 THEN (p.budget_used / p.budget) * 100
        ELSE 0
    END AS budget_utilized_percentage,
    p.estimated_hours,
    p.actual_hours,
    CASE
        WHEN p.estimated_hours > 0 THEN (p.actual_hours / p.estimated_hours) * 100
        ELSE 0
    END AS hours_utilized_percentage,
    DATEDIFF(p.end_date, CURRENT_DATE()) AS days_remaining,
    DATEDIFF(p.end_date, p.start_date) AS total_days,
    DATEDIFF(CURRENT_DATE(), p.start_date) AS days_elapsed,
    CASE
        WHEN DATEDIFF(p.end_date, p.start_date) > 0 
        THEN (DATEDIFF(CURRENT_DATE(), p.start_date) / DATEDIFF(p.end_date, p.start_date)) * 100
        ELSE 0
    END AS time_elapsed_percentage,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.project_id) AS total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE project_id = p.project_id AND status = 'Done') AS completed_tasks,
    COALESCE(
        (SELECT AVG(time_in_status) 
         FROM task_status_history tsh
         JOIN tasks t ON tsh.task_id = t.task_id
         WHERE t.project_id = p.project_id
         AND tsh.old_status = 'InProgress' 
         AND tsh.new_status = 'Done'),
        0
    ) AS avg_completion_time_minutes
FROM 
    projects p
WHERE 
    p.project_id = :project_id;

-- Get task statistics by status
SELECT 
    t.status,
    COUNT(*) AS task_count,
    SUM(t.estimated_hours) AS total_estimated_hours,
    SUM(t.actual_hours) AS total_actual_hours,
    ROUND(AVG(t.estimated_hours), 2) AS avg_estimated_hours,
    ROUND(AVG(t.actual_hours), 2) AS avg_actual_hours
FROM 
    tasks t
WHERE 
    t.project_id = :project_id
GROUP BY 
    t.status
ORDER BY 
    FIELD(t.status, 'Backlog', 'Todo', 'InProgress', 'Review', 'Done');

-- Get task statistics by priority
SELECT 
    t.priority,
    COUNT(*) AS task_count,
    COUNT(CASE WHEN t.status = 'Done' THEN 1 END) AS completed_count,
    ROUND(
        (COUNT(CASE WHEN t.status = 'Done' THEN 1 END) / COUNT(*)) * 100, 
        2
    ) AS completion_percentage
FROM 
    tasks t
WHERE 
    t.project_id = :project_id
GROUP BY 
    t.priority
ORDER BY 
    FIELD(t.priority, 'Low', 'Medium', 'High', 'Critical');

-- Get time tracking statistics
SELECT 
    DATE_FORMAT(te.entry_date, '%Y-%m-%d') AS entry_date,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT te.user_id) AS active_users,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on
FROM 
    time_entries te
JOIN 
    tasks t ON te.task_id = t.task_id
WHERE 
    t.project_id = :project_id
    AND te.entry_date BETWEEN 
        COALESCE(:date_from, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
        AND COALESCE(:date_to, CURRENT_DATE())
GROUP BY 
    DATE_FORMAT(te.entry_date, '%Y-%m-%d')
ORDER BY 
    entry_date;

-- Get user productivity statistics
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    COUNT(DISTINCT 
        CASE WHEN tsh.new_status = 'Done' THEN tsh.task_id END
    ) AS tasks_completed,
    ROUND(
        SUM(te.time_spent) / 
        NULLIF(COUNT(DISTINCT te.task_id), 0),
        2
    ) AS avg_hours_per_task
FROM 
    users u
JOIN 
    time_entries te ON u.user_id = te.user_id
JOIN 
    tasks t ON te.task_id = t.task_id
LEFT JOIN 
    task_status_history tsh ON t.task_id = tsh.task_id AND tsh.user_id = u.user_id
WHERE 
    t.project_id = :project_id
GROUP BY 
    u.user_id, user_name
ORDER BY 
    hours_logged DESC;

-- Get sprint statistics (if using Scrum)
SELECT 
    s.sprint_id,
    s.name,
    s.start_date,
    s.end_date,
    s.status,
    s.capacity,
    s.velocity,
    COUNT(st.task_id) AS total_tasks,
    COUNT(CASE WHEN t.status = 'Done' THEN 1 END) AS completed_tasks,
    SUM(st.story_points) AS total_story_points,
    SUM(CASE WHEN t.status = 'Done' THEN st.story_points ELSE 0 END) AS completed_story_points,
    ROUND(
        (SUM(CASE WHEN t.status = 'Done' THEN st.story_points ELSE 0 END) / 
        NULLIF(SUM(st.story_points), 0)) * 100, 
        2
    ) AS completion_percentage
FROM 
    sprints s
LEFT JOIN 
    sprint_tasks st ON s.sprint_id = st.sprint_id
LEFT JOIN 
    tasks t ON st.task_id = t.task_id
WHERE 
    s.project_id = :project_id
GROUP BY 
    s.sprint_id, s.name, s.start_date, s.end_date, s.status, s.capacity, s.velocity
ORDER BY 
    s.start_date DESC;