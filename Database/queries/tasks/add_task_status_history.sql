INSERT INTO task_status_history (
  task_id, user_id, old_status, new_status, notes, time_in_status
)
VALUES (
  ?, ?, ?, ?, ?, ?
);
