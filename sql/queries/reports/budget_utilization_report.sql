-- File: queries/reports/budget_utilization_method.sql

-- Get budget utilization by project
SELECT 
    p.project_id,
    p.name AS project_name,
    p.status,
    p.budget,
    p.budget_used,
    CASE
        WHEN p.budget > 0 THEN ROUND((p.budget_used / p.budget) * 100, 2)
        ELSE 0
    END AS budget_utilized_percentage,
    p.estimated_hours,
    p.actual_hours,
    CASE
        WHEN p.estimated_hours > 0 THEN ROUND((p.actual_hours / p.estimated_hours) * 100, 2)
        ELSE 0
    END AS time_utilized_percentage,
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
    ) AS completed_tasks
FROM 
    projects p
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND (COALESCE(:status, '') = '' OR p.status = :status)
    AND (
        COALESCE(:owner_id, 0) = 0 
        OR p.owner_id = :owner_id
        OR EXISTS (
            SELECT 1 
            FROM project_members pm 
            WHERE pm.project_id = p.project_id 
            AND pm.user_id = :owner_id 
            AND pm.member_type = 'Owner'
        )
    )
ORDER BY 
    budget_utilized_percentage DESC;

-- Get budget utilization by team member
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    p.project_id,
    p.name AS project_name,
    pm.role_in_project,
    SUM(te.time_spent) AS hours_logged,
    pm.hourly_rate,
    ROUND(SUM(te.time_spent) * pm.hourly_rate, 2) AS cost,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on
FROM 
    users u
JOIN 
    project_members pm ON u.user_id = pm.user_id
JOIN 
    projects p ON pm.project_id = p.project_id
LEFT JOIN 
    time_entries te ON u.user_id = te.user_id
LEFT JOIN 
    tasks t ON te.task_id = t.task_id AND t.project_id = p.project_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND pm.hourly_rate IS NOT NULL
GROUP BY 
    u.user_id, user_name, p.project_id, project_name, pm.role_in_project, pm.hourly_rate
ORDER BY 
    cost DESC;

-- Get budget utilization over time (by month)
SELECT 
    DATE_FORMAT(te.entry_date, '%Y-%m') AS month,
    p.project_id,
    p.name AS project_name,
    SUM(te.time_spent) AS hours_logged,
    SUM(te.time_spent * COALESCE(pm.hourly_rate, 0)) AS cost,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    COUNT(DISTINCT te.user_id) AS members_active
FROM 
    time_entries te
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    project_members pm ON te.user_id = pm.user_id AND pm.project_id = p.project_id
WHERE 
    (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND te.entry_date BETWEEN 
        COALESCE(:date_from, DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)) 
        AND COALESCE(:date_to, CURRENT_DATE())
GROUP BY 
    month, p.project_id, project_name
ORDER BY 
    month, project_name;

-- Get budget utilization by task type
SELECT 
    tt.type_name,
    COUNT(t.task_id) AS task_count,
    SUM(t.budget_used) AS budget_used,
    ROUND(
        (SUM(t.budget_used) / NULLIF(
            (SELECT SUM(budget_used) FROM tasks WHERE project_id = :project_id),
            0
        )) * 100,
        2
    ) AS percentage_of_total,
    SUM(t.estimated_hours) AS estimated_hours,
    SUM(t.actual_hours) AS actual_hours,
    ROUND(
        SUM(t.actual_hours) / NULLIF(SUM(t.estimated_hours), 0) * 100,
        2
    ) AS time_accuracy_percentage
FROM 
    tasks t
JOIN 
    task_types tt ON t.type = tt.type_id
WHERE 
    t.project_id = :project_id
GROUP BY 
    tt.type_name
ORDER BY 
    budget_used DESC;

-- Get budget utilization forecast
SELECT 
    p.project_id,
    p.name,
    p.budget,
    p.budget_used,
    p.budget - p.budget_used AS budget_remaining,
    CASE
        WHEN p.budget > 0 THEN ROUND((p.budget_used / p.budget) * 100, 2)
        ELSE 0
    END AS budget_utilized_percentage,
    -- Calculate burn rate (average daily spend)
    ROUND(
        p.budget_used / NULLIF(DATEDIFF(CURRENT_DATE(), p.start_date), 0),
        2
    ) AS daily_burn_rate,
    -- Forecast days remaining at current burn rate
    ROUND(
        (p.budget - p.budget_used) / NULLIF(
            p.budget_used / NULLIF(DATEDIFF(CURRENT_DATE(), p.start_date), 0),
            0
        ),
        0
    ) AS forecast_days_remaining,
    -- Forecast completion date at current burn rate
    DATE_ADD(
        CURRENT_DATE(),
        INTERVAL ROUND(
            (p.budget - p.budget_used) / NULLIF(
                p.budget_used / NULLIF(DATEDIFF(CURRENT_DATE(), p.start_date), 0),
                0
            ),
            0
        ) DAY
    ) AS forecast_completion_date,
    -- Check if forecast exceeds planned end date
    CASE
        WHEN DATE_ADD(
            CURRENT_DATE(),
            INTERVAL ROUND(
                (p.budget - p.budget_used) / NULLIF(
                    p.budget_used / NULLIF(DATEDIFF(CURRENT_DATE(), p.start_date), 0),
                    0
                ),
                0
            ) DAY
        ) > p.end_date THEN TRUE
        ELSE FALSE
    END AS is_over_budget
FROM 
    projects p
WHERE 
    p.project_id = :project_id
    AND p.status = 'Active';