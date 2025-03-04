-- File: queries/admin/manage_users.sql

-- Get all users with their roles
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.is_active,
    u.created_at,
    u.last_login,
    GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name SEPARATOR ', ') AS roles,
    MAX(CASE WHEN r.is_admin = 1 THEN 1 ELSE 0 END) AS is_admin,
    COUNT(DISTINCT pm.project_id) AS project_count,
    MAX(tl.last_activity) AS last_activity
FROM 
    users u
LEFT JOIN 
    user_roles ur ON u.user_id = ur.user_id
LEFT JOIN 
    roles r ON ur.role_id = r.role_id
LEFT JOIN 
    project_members pm ON u.user_id = pm.user_id
LEFT JOIN (
    -- Get the most recent activity for each user
    SELECT 
        user_id, 
        MAX(action_time) AS last_activity
    FROM 
        audit_logs
    WHERE 
        user_id IS NOT NULL
    GROUP BY 
        user_id
) tl ON u.user_id = tl.user_id
WHERE
    (COALESCE(:role_id, 0) = 0 OR ur.role_id = :role_id)
    AND (COALESCE(:is_active, -1) = -1 OR u.is_active = :is_active)
    AND (
        COALESCE(:search_term, '') = ''
        OR u.first_name LIKE CONCAT('%', :search_term, '%')
        OR u.last_name LIKE CONCAT('%', :search_term, '%')
        OR u.email LIKE CONCAT('%', :search_term, '%')
    )
GROUP BY 
    u.user_id, u.first_name, u.last_name, u.email, u.is_active, u.created_at, u.last_login
ORDER BY 
    CASE WHEN :sort_field = 'name' THEN CONCAT(u.first_name, ' ', u.last_name) END,
    CASE WHEN :sort_field = 'email' THEN u.email END,
    CASE WHEN :sort_field = 'created_at' THEN u.created_at END,
    CASE WHEN :sort_field = 'last_login' THEN u.last_login END,
    CASE WHEN :sort_field = 'last_activity' THEN tl.last_activity END,
    CASE WHEN :sort_field = 'project_count' THEN COUNT(DISTINCT pm.project_id) END
LIMIT :limit OFFSET :offset;

-- Activate/Deactivate user
UPDATE users
SET is_active = :is_active,
    last_password_change = CASE WHEN :is_active = 0 THEN NULL ELSE last_password_change END
WHERE user_id = :user_id;

-- Reset user password and force change on next login
UPDATE users
SET reset_token = UUID(),
    reset_token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR),
    require_password_change = 1
WHERE user_id = :user_id;

-- Add role to user
INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
VALUES (:user_id, :role_id, :admin_user_id, NOW())
ON DUPLICATE KEY UPDATE assigned_by = :admin_user_id, assigned_at = NOW();

-- Remove role from user
DELETE FROM user_roles
WHERE user_id = :user_id AND role_id = :role_id;

-- Get user activity log
SELECT