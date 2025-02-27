-- Get detailed information about a specific project
SELECT 
    p.*,
    CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
    u.email AS owner_email,
    u.image_url AS owner_image,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id) AS total_tasks,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status = 'Done') AS completed_tasks,
    (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.project_id) AS total_members,
    (SELECT SUM(time_spent) FROM time_entries te 
     JOIN tasks t ON te.task_id = t.task_id 
     WHERE t.project_id = p.project_id) AS total_time_spent
FROM 
    projects p
JOIN 
    users u ON p.owner_id = u.user_id
WHERE 
    p.project_id = ?;