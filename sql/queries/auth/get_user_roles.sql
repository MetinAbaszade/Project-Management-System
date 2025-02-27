
SELECT 
    r.role_id, 
    r.role_name, 
    r.is_admin,
    r.description,
    ur.assigned_at,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_by_name
FROM 
    roles r
JOIN 
    user_roles ur ON r.role_id = ur.role_id
LEFT JOIN
    users u ON ur.assigned_by = u.user_id
WHERE 
    ur.user_id = ?;