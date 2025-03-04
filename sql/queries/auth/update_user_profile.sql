-- File: queries/auth/update_user_profile.sql

-- Update user profile information
UPDATE users
SET 
    first_name = :first_name,
    last_name = :last_name,
    image_url = COALESCE(:image_url, image_url)
WHERE 
    user_id = :user_id;

-- Update user email (with validation check)
UPDATE users
SET 
    email = :new_email
WHERE 
    user_id = :user_id
    AND NOT EXISTS (
        SELECT 1 FROM users 
        WHERE email = :new_email 
        AND user_id != :user_id
    );

-- Update user password
UPDATE users
SET 
    password = :new_password_hash,
    require_password_change = FALSE,
    last_password_change = CURRENT_TIMESTAMP,
    reset_token = NULL,
    reset_token_expires = NULL
WHERE 
    user_id = :user_id;

-- Validate current password
SELECT 
    EXISTS (
        SELECT 1 
        FROM users 
        WHERE user_id = :user_id
        AND password = :current_password_hash
    ) AS password_correct;

-- Set password reset token
UPDATE users
SET 
    reset_token = UUID(),
    reset_token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR)
WHERE 
    email = :email
    AND is_active = TRUE;

-- Reset password with token
UPDATE users
SET 
    password = :new_password_hash,
    reset_token = NULL,
    reset_token_expires = NULL,
    require_password_change = FALSE,
    last_password_change = CURRENT_TIMESTAMP
WHERE 
    reset_token = :reset_token
    AND reset_token_expires > NOW();

-- Log profile update
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
    :user_id,
    'UPDATE',
    'USER_PROFILE',
    :user_id,
    NOW(),
    :ip_address,
    :changes_description
);

-- Log password change
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    action_time,
    ip_address
)
VALUES (
    :user_id,
    'PASSWORD_CHANGE',
    'USER',
    :user_id,
    NOW(),
    :ip_address
);