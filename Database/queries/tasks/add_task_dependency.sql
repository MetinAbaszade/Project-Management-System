INSERT INTO task_dependencies (
  task_id, dependent_task_id, dependency_type, created_by
)
VALUES (
  ?, ?, ?, ?
);

