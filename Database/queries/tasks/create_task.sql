INSERT INTO tasks (
  project_id, title, description, type, priority, status, created_by, assigned_to, deadline, estimated_hours, is_billable
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
);
