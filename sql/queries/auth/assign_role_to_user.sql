-- File: queries/auth/assign_role_to_user.sql

-- Assign a role to a user
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (:user_id, :role_id, :assigned_by, NOW())
ON DUPLICATE KEY UPDATE
    assigned_by = :assigned_by,
    assigned_at = NOW();

-- Check if the assigner has permission to assign this role
-- (This would typically be done in application logic, but here's a helper query)
SELECT 
    EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = :assigned_by
        AND r.is_admin = TRUE
    ) AS has_permission;

-- Get available roles that can be assigned 
-- (Excludes roles already assigned to the user)
SELECT 
    r.role_id,
    r.role_name,
    r.description,
    r.is_admin
FROM 
    roles r
WHERE 
    r.role_id NOT IN (
        SELECT role_id 
        FROM user_roles 
        WHERE user_id = :user_id
    )
ORDER BY 
    r.role_name;

-- Remove a role from a user
DELETE FROM user_roles
WHERE user_id = :user_id AND role_id = :role_id;

-- Log role assignment
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    action_time,
    ip_address,
    changes_made
)
VALUES (
    :assigned_by,
    'ASSIGN',
    'USER_ROLE',
    :user_id,
    NOW(),
    :ip_address,
    CONCAT(
        'Assigned role "', 
        (SELECT role_name FROM roles WHERE role_id = :role_id),
        '" to user "',
        (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE user_id = :user_id),
        '"'
    )
);