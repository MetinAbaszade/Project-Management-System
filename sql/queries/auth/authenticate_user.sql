-- File: queries/auth/authenticate_user.sql

-- Retrieve user for authentication
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.password,
    u.is_active,
    u.login_attempts,
    u.require_password_change,
    MAX(CASE WHEN r.is_admin = 1 THEN 1 ELSE 0 END) AS is_admin,
    GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name SEPARATOR ',') AS roles,
    GROUP_CONCAT(DISTINCT r.role_id ORDER BY r.role_id SEPARATOR ',') AS role_ids
FROM 
    users u
LEFT JOIN 
    user_roles ur ON u.user_id = ur.user_id
LEFT JOIN 
    roles r ON ur.role_id = r.role_id
WHERE 
    u.email = :email
    AND u.is_active = TRUE
GROUP BY 
    u.user_id, u.first_name, u.last_name, u.email, u.password, u.is_active, 
    u.login_attempts, u.require_password_change;

-- Update last login time
UPDATE users
SET 
    last_login = CURRENT_TIMESTAMP,
    login_attempts = 0
WHERE 
    user_id = :user_id;

-- Increment failed login attempt
UPDATE users
SET 
    login_attempts = login_attempts + 1
WHERE 
    email = :email;

-- Lock account after too many failed attempts
UPDATE users
SET 
    is_active = FALSE,
    reset_token = UUID(),
    reset_token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR)
WHERE 
    email = :email
    AND login_attempts >= 5;

-- Log successful login
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    action_time,
    ip_address,
    user_agent,
    request_method,
    request_path
)
VALUES (
    :user_id,
    'LOGIN',
    'USER',
    :user_id,
    NOW(),
    :ip_address,
    :user_agent,
    'POST',
    '/api/auth/login'
);

-- Log failed login
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    action_time,
    ip_address,
    user_agent,
    request_method,
    request_path,
    status_code
)
VALUES (
    NULL,
    'LOGIN_FAILED',
    'USER',
    NOW(),
    :ip_address,
    :user_agent,
    'POST',
    '/api/auth/login',
    401
);

-- Log logout
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    action_time,
    ip_address,
    user_agent,
    request_method,
    request_path
)
VALUES (
    :user_id,
    'LOGOUT',
    'USER',
    :user_id,
    NOW(),
    :ip_address,
    :user_agent,
    'POST',
    '/api/auth/logout'
);