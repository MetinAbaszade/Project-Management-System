-- Generate a time report for a project
SELECT 
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    tt.type_name AS task_type,
    t.title AS task_title,
    t.task_id,
    SUM(te.time_spent) AS total_hours,
    MIN(te.entry_date) AS first_entry_date,
    MAX(te.entry_date) AS last_entry_date,
    COUNT(DISTINCT te.time_entry_id) AS entry_count,
    CASE
        WHEN t.estimated_hours > 0 THEN (SUM(te.time_spent) / t.estimated_hours * 100)
        ELSE NULL
    END AS percentage_of_estimate,
    te.billable
FROM 
    time_entries te
JOIN 
    tasks t ON te.task_id = t.task_id
JOIN 
    users u ON te.user_id = u.user_id
LEFT JOIN 
    task_types tt ON t.type = tt.type_id
WHERE 
    t.project_id = ? AND
    (? IS NULL OR te.entry_date >= ?) AND -- Filter by start_date
    (? IS NULL OR te.entry_date <= ?) -- Filter by end_date
GROUP BY 
    u.user_id, 
    t.task_id, 
    te.billable
ORDER BY 
    u.first_name, 
    t.title;