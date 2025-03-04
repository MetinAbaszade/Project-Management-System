-- File: queries/auth/get_user_by_email.sql

-- Get user by email with basic information
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    is_active,
    created_at,
    last_login,
    image_url,
    require_password_change
FROM 
    users
WHERE 
    email = :email;

-- Get user by email with roles
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.is_active,
    u.created_at,
    u.last_login,
    u.image_url,
    u.require_password_change,
    GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name SEPARATOR ', ') AS roles,
    MAX(CASE WHEN r.is_admin = 1 THEN 1 ELSE 0 END) AS is_admin
FROM 
    users u
LEFT JOIN 
    user_roles ur ON u.user_id = ur.user_id
LEFT JOIN 
    roles r ON ur.role_id = r.role_id
WHERE 
    u.email = :email
GROUP BY 
    u.user_id, u.first_name, u.last_name, u.email, u.is_active, 
    u.created_at, u.last_login, u.image_url, u.require_password_change;

-- Check if email exists (for registration validation)
SELECT 
    EXISTS (
        SELECT 1 
        FROM users 
        WHERE email = :email
    ) AS email_exists;

-- Get user by reset token
SELECT 
    user_id,
    email,
    reset_token_expires
FROM 
    users
WHERE 
    reset_token = :reset_token
    AND reset_token_expires > NOW();

-- Get user by email for password reset
SELECT 
    user_id,
    email,
    first_name,
    last_name
FROM 
    users
WHERE 
    email = :email
    AND is_active = TRUE;