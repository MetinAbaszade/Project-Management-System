UPDATE admin_settings
SET setting_value = ?, last_updated = CURRENT_TIMESTAMP, updated_by = ?
WHERE setting_key = ?;
