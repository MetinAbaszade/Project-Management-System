UPDATE AdminSettings
SET settingSalue = ?, last_updated = CURRENT_TIMESTAMP, updated_by = ?
WHERE setting_key = ?;
