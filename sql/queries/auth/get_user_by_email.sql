-- Get user details by email address
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.image_url,
    u.is_active,
    u.created_at,
    u.last_login,
    GROUP_CONCAT(r.role_name) AS roles,
    MAX(r.is_admin) AS is_admin
FROM 
    users u
LEFT JOIN 
    user_roles ur ON u.user_id = ur.user_id
LEFT JOIN 
    roles r ON ur.role_id = r.role_id
WHERE 
    u.email = ?
GROUP BY 
    u.user_id;