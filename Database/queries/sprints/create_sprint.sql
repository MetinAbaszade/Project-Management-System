INSERT INTO sprints (
  project_id, name, start_date, end_date, goal, status, capacity, created_by
)
VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?
);
