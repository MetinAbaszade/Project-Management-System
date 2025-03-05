-- Get all users with their roles for admin management
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.image_url,
    u.is_active,
    u.created_at,
    u.last_login,
    u.login_attempts,
    u.last_password_change,
    u.require_password_change,
    GROUP_CONCAT(DISTINCT r.role_name SEPARATOR ', ') AS roles,
    MAX(r.is_admin) AS is_admin,
    COUNT(DISTINCT pm.project_id) AS project_count,
    COUNT(DISTINCT t.task_id) AS assigned_tasks_count,
    SUM(te.time_spent) AS total_hours_logged
FROM 
    users u
LEFT JOIN 
    user_roles ur ON u.user_id = ur.user_id
LEFT JOIN 
    roles r ON ur.role_id = r.role_id
LEFT JOIN 
    project_members pm ON u.user_id = pm.user_id
LEFT JOIN 
    tasks t ON u.user_id = t.assigned_to
LEFT JOIN 
    time_entries te ON u.user_id = te.user_id
WHERE 
    (? IS NULL OR u.is_active = ?) AND -- Filter by active status
    (? IS NULL OR u.email LIKE CONCAT('%', ?, '%')) -- Filter by email search
GROUP BY 
    u.user_id
ORDER BY 
    CASE WHEN ? = 'name_asc' THEN u.first_name END ASC,
    CASE WHEN ? = 'name_desc' THEN u.first_name END DESC,
    CASE WHEN ? = 'email_asc' THEN u.email END ASC,
    CASE WHEN ? = 'email_desc' THEN u.email END DESC,
    CASE WHEN ? = 'created_asc' THEN u.created_at END ASC,
    CASE WHEN ? = 'created_desc' THEN u.created_at END DESC,
    CASE WHEN ? = 'login_asc' THEN u.last_login END ASC,
    CASE WHEN ? = 'login_desc' THEN u.last_login END DESC,
    u.created_at DESC -- Default sort
LIMIT ?, ?; -- Pagination: offset, limit