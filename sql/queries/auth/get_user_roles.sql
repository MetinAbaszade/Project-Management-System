-- File: queries/auth/get_user_roles.sql

-- Get all roles assigned to a specific user
SELECT 
    r.role_id,
    r.role_name,
    r.is_admin,
    r.description,
    ur.assigned_at,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_by_name
FROM 
    user_roles ur
JOIN 
    roles r ON ur.role_id = r.role_id
LEFT JOIN 
    users u ON ur.assigned_by = u.user_id
WHERE 
    ur.user_id = :user_id
ORDER BY 
    r.is_admin DESC, r.role_name;

-- Check if user has a specific role
SELECT 
    EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = :user_id
        AND r.role_name = :role_name
    ) AS has_role;

-- Check if user has admin privileges
SELECT 
    EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = :user_id
        AND r.is_admin = TRUE
    ) AS is_admin;

-- Get all available roles in the system
SELECT 
    role_id,
    role_name,
    is_admin,
    description,
    created_at
FROM 
    roles
WHERE 
    (COALESCE(:include_admin, 1) = 1 OR is_admin = FALSE)
ORDER BY 
    is_admin DESC, role_name;

-- Get users with a specific role
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.is_active,
    ur.assigned_at,
    CONCAT(a.first_name, ' ', a.last_name) AS assigned_by_name
FROM 
    user_roles ur
JOIN 
    users u ON ur.user_id = u.user_id
LEFT JOIN 
    users a ON ur.assigned_by = a.user_id
WHERE 
    ur.role_id = :role_id
ORDER BY 
    u.first_name, u.last_name;