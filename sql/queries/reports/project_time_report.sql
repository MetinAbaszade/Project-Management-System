-- File: queries/reports/project_time_report.sql

-- Get time logged by project
SELECT 
    p.project_id,
    p.name AS project_name,
    p.status,
    p.estimated_hours,
    SUM(te.time_spent) AS total_hours_logged,
    CASE 
        WHEN p.estimated_hours > 0 
        THEN ROUND((SUM(te.time_spent) / p.estimated_hours) * 100, 2)
        ELSE NULL
    END AS percentage_of_estimate,
    COUNT(DISTINCT te.time_entry_id) AS total_entries,
    COUNT(DISTINCT te.user_id) AS unique_users,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    ROUND(SUM(CASE WHEN te.billable THEN te.time_spent ELSE 0 END), 2) AS billable_hours,
    ROUND(SUM(CASE WHEN NOT te.billable THEN te.time_spent ELSE 0 END), 2) AS non_billable_hours,
    ROUND(
        (SUM(CASE WHEN te.billable THEN te.time_spent ELSE 0 END) / 
        NULLIF(SUM(te.time_spent), 0)) * 100,
        2
    ) AS billable_percentage
FROM 
    projects p
LEFT JOIN 
    tasks t ON p.project_id = t.project_id
LEFT JOIN 
    time_entries te ON t.task_id = te.task_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND (COALESCE(:status, '') = '' OR p.status = :status)
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    p.project_id, project_name, p.status, p.estimated_hours
ORDER BY 
    total_hours_logged DESC;

-- Get time logged by user and project
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    p.project_id,
    p.name AS project_name,
    pm.role_in_project,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    ROUND(SUM(CASE WHEN te.billable THEN te.time_spent ELSE 0 END), 2) AS billable_hours,
    ROUND(
        (SUM(CASE WHEN te.billable THEN te.time_spent ELSE 0 END) / 
        NULLIF(SUM(te.time_spent), 0)) * 100,
        2
    ) AS billable_percentage,
    MIN(te.entry_date) AS first_entry_date,
    MAX(te.entry_date) AS last_entry_date
FROM 
    users u
JOIN 
    time_entries te ON u.user_id = te.user_id
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    project_members pm ON u.user_id = pm.user_id AND p.project_id = pm.project_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND (COALESCE(:user_id, 0) = 0 OR u.user_id = :user_id)
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    u.user_id, user_name, p.project_id, project_name, pm.role_in_project
ORDER BY 
    hours_logged DESC;

-- Get daily time log report
SELECT 
    te.entry_date,
    p.project_id,
    p.name AS project_name,
    SUM(te.time_spent) AS total_hours,
    COUNT(DISTINCT te.user_id) AS users_logged,
    COUNT(DISTINCT te.task_id) AS tasks_worked
FROM 
    time_entries te
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND te.entry_date BETWEEN 
        COALESCE(:date_from, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
        AND COALESCE(:date_to, CURRENT_DATE())
GROUP BY 
    te.entry_date, p.project_id, project_name
ORDER BY 
    te.entry_date DESC;

-- Get time logged by task status
SELECT 
    t.status,
    COUNT(DISTINCT t.task_id) AS task_count,
    SUM(te.time_spent) AS hours_logged,
    ROUND(AVG(te.time_spent), 2) AS avg_hours_per_task,
    SUM(t.estimated_hours) AS total_estimated,
    CASE 
        WHEN SUM(t.estimated_hours) > 0 
        THEN ROUND((SUM(te.time_spent) / SUM(t.estimated_hours)) * 100, 2)
        ELSE NULL
    END AS percentage_of_estimate
FROM 
    tasks t
JOIN 
    time_entries te ON t.task_id = te.task_id
WHERE 
    t.project_id = :project_id
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    t.status
ORDER BY 
    FIELD(t.status, 'Backlog', 'Todo', 'InProgress', 'Review', 'Done');

-- Get weekly time log summary
SELECT 
    YEARWEEK(te.entry_date, 1) AS year_week,
    CONCAT(
        DATE_FORMAT(STR_TO_DATE(CONCAT(YEARWEEK(te.entry_date, 1), ' Monday'), '%X%V %W'), '%Y-%m-%d'),
        ' to ',
        DATE_FORMAT(STR_TO_DATE(CONCAT(YEARWEEK(te.entry_date, 1), ' Sunday'), '%X%V %W'), '%Y-%m-%d')
    ) AS week_range,
    p.project_id,
    p.name AS project_name,
    SUM(te.time_spent) AS total_hours,
    COUNT(DISTINCT te.user_id) AS unique_users,
    COUNT(DISTINCT te.task_id) AS tasks_worked,
    COUNT(DISTINCT 
        CASE WHEN tsh.new_status = 'Done' THEN tsh.task_id END
    ) AS tasks_completed
FROM 
    time_entries te
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    task_status_history tsh ON t.task_id = tsh.task_id AND YEARWEEK(tsh.updated_at, 1) = YEARWEEK(te.entry_date, 1)
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND te.entry_date BETWEEN 
        COALESCE(:date_from, DATE_SUB(CURRENT_DATE(), INTERVAL 12 WEEK)) 
        AND COALESCE(:date_to, CURRENT_DATE())
GROUP BY 
    year_week, week_range, p.project_id, project_name
ORDER BY 
    year_week DESC;