UPDATE tasks
SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
WHERE task_id = ?;
