SELECT c.*, u.first_name, u.last_name
FROM comments c
LEFT JOIN users u ON c.user_id = u.user_id
WHERE c.task_id = ?
ORDER BY c.created_at ASC;
