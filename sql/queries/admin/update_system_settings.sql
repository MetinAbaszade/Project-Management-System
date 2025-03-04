-- File: queries/admin/update_system_settings.sql

-- Get all system settings with categories
SELECT 
    setting_id,
    setting_key,
    setting_value,
    category,
    description,
    is_encrypted,
    data_type,
    validation_regex,
    default_value,
    last_updated,
    CONCAT(u.first_name, ' ', u.last_name) AS updated_by_user
FROM 
    admin_settings a
LEFT JOIN 
    users u ON a.updated_by = u.user_id
WHERE 
    (COALESCE(:category, '') = '' OR a.category = :category)
ORDER BY 
    a.category, a.setting_key;

-- Update a specific setting
UPDATE admin_settings
SET 
    setting_value = :setting_value,
    updated_by = :admin_user_id,
    last_updated = CURRENT_TIMESTAMP
WHERE 
    setting_key = :setting_key;

-- Add a new system setting
INSERT INTO admin_settings (
    setting_key,
    setting_value,
    category,
    description,
    is_encrypted,
    data_type,
    validation_regex,
    default_value,
    updated_by
)
VALUES (
    :setting_key,
    :setting_value,
    :category,
    :description,
    :is_encrypted,
    :data_type,
    :validation_regex,
    :default_value,
    :admin_user_id
)
ON DUPLICATE KEY UPDATE
    setting_value = :setting_value,
    category = :category,
    description = :description,
    is_encrypted = :is_encrypted,
    data_type = :data_type,
    validation_regex = :validation_regex,
    default_value = :default_value,
    updated_by = :admin_user_id,
    last_updated = CURRENT_TIMESTAMP;

-- Get all setting categories
SELECT DISTINCT 
    category 
FROM 
    admin_settings 
ORDER BY 
    category;

-- Delete a system setting
DELETE FROM admin_settings
WHERE setting_key = :setting_key;

-- Get system maintenance status
SELECT 
    setting_value AS maintenance_mode
FROM 
    admin_settings
WHERE 
    setting_key = 'system_maintenance_mode';

-- Update system maintenance mode
UPDATE admin_settings
SET 
    setting_value = :maintenance_mode,
    updated_by = :admin_user_id,
    last_updated = CURRENT_TIMESTAMP
WHERE 
    setting_key = 'system_maintenance_mode';

-- Log setting change
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    action_time,
    ip_address,
    request_method,
    changes_made
)
VALUES (
    :admin_user_id,
    'UPDATE',
    'SYSTEM_SETTING',
    (SELECT setting_id FROM admin_settings WHERE setting_key = :setting_key),
    CURRENT_TIMESTAMP,
    :ip_address,
    'POST',
    CONCAT('Changed setting "', :setting_key, '" from "', :old_value, '" to "', :new_value, '"')
);