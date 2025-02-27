-- Check if login credentials are valid and update login stats
BEGIN;

-- Get user with password for validation
SELECT 
    user_id,
    email,
    password,
    is_active,
    login_attempts,
    require_password_change
FROM 
    users 
WHERE 
    email = ?;

-- Update login statistics on successful login
UPDATE users
SET 
    last_login = CURRENT_TIMESTAMP,
    login_attempts = 0
WHERE 
    email = ?;

COMMIT;