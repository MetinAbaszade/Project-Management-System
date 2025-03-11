DELETE FROM task_dependencies
WHERE task_id = ? AND dependent_task_id = ?;
