UPDATE notifications
SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
WHERE notification_id = ?;
