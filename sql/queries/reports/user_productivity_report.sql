-- File: queries/reports/user_productivity_report.sql

-- Get overall user productivity metrics
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    u.image_url,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    COUNT(DISTINCT
        CASE WHEN tsh.new_status = 'Done' AND tsh.user_id = u.user_id THEN tsh.task_id END
    ) AS tasks_completed,
    SUM(te.time_spent) AS total_hours_logged,
    ROUND(AVG(te.time_spent), 2) AS avg_hours_per_entry,
    COUNT(DISTINCT CASE WHEN t.status = 'InProgress' AND t.assigned_to = u.user_id THEN t.task_id END) AS currently_assigned,
    COUNT(DISTINCT p.project_id) AS active_projects,
    MAX(te.entry_date) AS last_activity_date
FROM 
    users u
LEFT JOIN 
    time_entries te ON u.user_id = te.user_id
LEFT JOIN 
    tasks t ON te.task_id = t.task_id
LEFT JOIN 
    projects p ON t.project_id = p.project_id AND p.status = 'Active'
LEFT JOIN 
    task_status_history tsh ON t.task_id = tsh.task_id
WHERE 
    (COALESCE(:user_id, 0) = 0 OR u.user_id = :user_id)
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    u.user_id, user_name, u.email, u.image_url
ORDER BY 
    total_hours_logged DESC;

-- Get daily productivity by user
SELECT 
    te.entry_date,
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT te.task_id) AS unique_tasks,
    COUNT(DISTINCT p.project_id) AS unique_projects,
    COUNT(DISTINCT
        CASE WHEN tsh.new_status = 'Done' AND tsh.user_id = u.user_id THEN tsh.task_id END
    ) AS tasks_completed
FROM 
    users u
JOIN 
    time_entries te ON u.user_id = te.user_id
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    task_status_history tsh ON t.task_id = tsh.task_id AND DATE(tsh.updated_at) = te.entry_date
WHERE 
    (COALESCE(:user_id, 0) = 0 OR u.user_id = :user_id)
    AND te.entry_date BETWEEN 
        COALESCE(:date_from, DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
        AND COALESCE(:date_to, CURRENT_DATE())
GROUP BY 
    te.entry_date, u.user_id, user_name
ORDER BY 
    te.entry_date DESC,
    hours_logged DESC;

-- Get user productivity by project
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    p.project_id,
    p.name AS project_name,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT
        CASE WHEN tsh.new_status = 'Done' AND tsh.user_id = u.user_id THEN tsh.task_id END
    ) AS tasks_completed,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id
        AND assigned_to = u.user_id
    ) AS assigned_tasks,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE project_id = p.project_id
        AND assigned_to = u.user_id
        AND status != 'Done'
    ) AS open_assigned_tasks
FROM 
    users u
JOIN 
    time_entries te ON u.user_id = te.user_id
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    projects p ON t.project_id = p.project_id
LEFT JOIN 
    task_status_history tsh ON t.task_id = tsh.task_id
WHERE 
    (COALESCE(:user_id, 0) = 0 OR u.user_id = :user_id)
    AND (COALESCE(:project_id, 0) = 0 OR p.project_id = :project_id)
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    u.user_id, user_name, p.project_id, project_name
ORDER BY 
    hours_logged DESC;

-- Get team productivity comparison
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    t.team_id,
    t.name AS team_name,
    SUM(te.time_spent) AS hours_logged,
    COUNT(DISTINCT te.task_id) AS tasks_worked_on,
    COUNT(DISTINCT
        CASE WHEN tsh.new_status = 'Done' AND tsh.user_id = u.user_id THEN tsh.task_id END
    ) AS tasks_completed,
    (
        SELECT COUNT(*) 
        FROM tasks 
        WHERE assigned_to = u.user_id
        AND status != 'Done'
    ) AS open_assigned_tasks,
    ROUND(
        SUM(te.time_spent) / (
            SELECT AVG(subquery.user_hours)
            FROM (
                SELECT temp_u.user_id, SUM(temp_te.time_spent) AS user_hours
                FROM users temp_u
                JOIN team_members temp_tm ON temp_u.user_id = temp_tm.user_id
                LEFT JOIN time_entries temp_te ON temp_u.user_id = temp_te.user_id
                WHERE temp_tm.team_id = t.team_id
                AND (
                    :date_from IS NULL OR :date_to IS NULL OR
                    temp_te.entry_date BETWEEN :date_from AND :date_to
                )
                GROUP BY temp_u.user_id
            ) subquery
        ) * 100,
        2
    ) AS percentage_of_team_average
FROM 
    users u
JOIN 
    team_members tm ON u.user_id = tm.user_id
JOIN 
    teams t ON tm.team_id = t.team_id
LEFT JOIN 
    time_entries te ON u.user_id = te.user_id
LEFT JOIN 
    tasks task ON te.task_id = task.task_id
LEFT JOIN 
    task_status_history tsh ON task.task_id = tsh.task_id
WHERE 
    (COALESCE(:team_id, 0) = 0 OR t.team_id = :team_id)
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    u.user_id, user_name, t.team_id, team_name
ORDER BY 
    t.team_id, hours_logged DESC;

-- Get user efficiency metrics
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    -- Task completion efficiency
    COUNT(DISTINCT
        CASE WHEN tsh.new_status = 'Done' AND tsh.user_id = u.user_id THEN tsh.task_id END
    ) AS tasks_completed,
    
    -- Estimated vs actual hours ratio
    ROUND(
        SUM(task.estimated_hours) / NULLIF(SUM(te.time_spent), 0),
        2
    ) AS estimate_accuracy_ratio,
    
    -- Average time to complete tasks
    ROUND(
        AVG(
            CASE WHEN task.status = 'Done' AND task.actual_hours > 0
            THEN task.actual_hours
            ELSE NULL END
        ),
        2
    ) AS avg_completion_time,
    
    -- Relative productivity (compared to team average)
    ROUND(
        SUM(te.time_spent) / (
            SELECT AVG(subquery.user_hours)
            FROM (
                SELECT temp_u.user_id, SUM(COALESCE(temp_te.time_spent, 0)) AS user_hours
                FROM users temp_u
                LEFT JOIN time_entries temp_te ON temp_u.user_id = temp_te.user_id
                WHERE temp_u.user_id IN (
                    SELECT user_id FROM team_members 
                    WHERE team_id IN (SELECT team_id FROM team_members WHERE user_id = u.user_id)
                )
                AND (
                    :date_from IS NULL OR :date_to IS NULL OR
                    temp_te.entry_date BETWEEN :date_from AND :date_to
                )
                GROUP BY temp_u.user_id
            ) subquery
        ) * 100,
        2
    ) AS team_productivity_percentage,
    
    -- Task complexity indicator (average story points or task completion time)
    ROUND(
        AVG(
            CASE 
                WHEN st.story_points IS NOT NULL THEN st.story_points
                ELSE COALESCE(task.actual_hours / NULLIF(task.estimated_hours, 0), 1)
            END
        ),
        2
    ) AS avg_task_complexity
FROM 
    users u
LEFT JOIN 
    time_entries te ON u.user_id = te.user_id
LEFT JOIN 
    tasks task ON te.task_id = task.task_id
LEFT JOIN 
    task_status_history tsh ON task.task_id = tsh.task_id
LEFT JOIN 
    sprint_tasks st ON task.task_id = st.task_id
WHERE 
    (COALESCE(:user_id, 0) = 0 OR u.user_id = :user_id)
    AND (
        :date_from IS NULL OR :date_to IS NULL OR
        te.entry_date BETWEEN :date_from AND :date_to
    )
GROUP BY 
    u.user_id, user_name
ORDER BY 
    tasks_completed DESC;