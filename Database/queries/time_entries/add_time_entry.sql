INSERT INTO time_entries (
  task_id, user_id, time_spent, entry_date, start_time, end_time, description, billable
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?
);
