SELECT *
FROM task_status_history
WHERE task_id = ?
ORDER BY updated_at DESC;

