SELECT *
FROM notifications
WHERE user_id = ? AND is_read = FALSE
ORDER BY created_at DESC;
