UPDATE system_notifications
SET is_dismissible = FALSE
WHERE notification_id = ?;
