-- Get all projects where the user is either an owner or a member
SELECT 
    p.*,
    CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
    CASE 
        WHEN p.owner_id = ? THEN 'Owner'
        ELSE pm.member_type
    END AS user_role,
    pm.role_in_project,
    COUNT(DISTINCT t.task_id) AS total_tasks,
    SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks
FROM 
    projects p
LEFT JOIN 
    users u ON p.owner_id = u.user_id
LEFT JOIN 
    project_members pm ON p.project_id = pm.project_id AND pm.user_id = ?
LEFT JOIN 
    tasks t ON p.project_id = t.project_id
WHERE 
    p.owner_id = ? OR pm.user_id = ?
GROUP BY 
    p.project_id
ORDER BY 
    p.created_at DESC;