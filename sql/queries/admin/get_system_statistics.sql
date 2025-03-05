-- Get system-wide statistics for admin dashboard
SELECT 
    -- User Statistics
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
    (SELECT COUNT(*) FROM users WHERE is_active = FALSE) AS inactive_users,
    (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AS new_users_last_30days,
    
    -- Project Statistics
    (SELECT COUNT(*) FROM projects WHERE status = 'Active') AS active_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'Completed') AS completed_projects,
    (SELECT COUNT(*) FROM projects WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AS new_projects_last_30days,
    
    -- Task Statistics
    (SELECT COUNT(*) FROM tasks) AS total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'Done') AS completed_tasks,
    (SELECT COUNT(*) FROM tasks WHERE deadline < CURRENT_DATE() AND status != 'Done') AS overdue_tasks,
    
    -- Time Tracking
    (SELECT SUM(time_spent) FROM time_entries WHERE entry_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) AS hours_logged_last_30days,
    
    -- Activity
    (SELECT COUNT(*) FROM audit_logs WHERE action_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)) AS actions_last_7days,
    
    -- Storage
    (SELECT COUNT(*) FROM task_attachments) + (SELECT COUNT(*) FROM project_attachments) AS total_attachments;