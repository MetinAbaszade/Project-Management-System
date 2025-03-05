INSERT INTO subtasks (
  parent_task_id, assigned_to, title, description, status, estimated_hours
)
VALUES (
  ?, ?, ?, ?, ?, ?
);
