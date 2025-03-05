-- Update a system setting
UPDATE admin_settings
SET 
    setting_value = ?,
    last_updated = CURRENT_TIMESTAMP,
    updated_by = ?
WHERE 
    setting_key = ?;

-- Insert an audit log entry for the settings update
INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    changes_made
) VALUES (
    ?, -- user_id
    'UPDATE_SETTING',
    'ADMIN_SETTING',
    (SELECT setting_id FROM admin_settings WHERE setting_key = ?),
    CONCAT('{"old_value":"', (SELECT setting_value FROM admin_settings WHERE setting_key = ?), '", "new_value":"', ?, '"}')
);