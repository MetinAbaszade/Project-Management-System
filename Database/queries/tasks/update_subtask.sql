UPDATE subtasks
SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
WHERE subtask_id = ?;

